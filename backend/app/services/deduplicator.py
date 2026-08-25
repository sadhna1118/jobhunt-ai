"""Deduplication services for jobs and recruiters."""
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from typing import List, Optional, Tuple

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, Job, Message, Recruiter, RecruiterStatusEnum


class JobDeduplicator:
    """Service for detecting and preventing duplicate job applications."""

    async def is_duplicate_application(
        self,
        db: AsyncSession,
        user_id: int,
        job_id: Optional[int] = None,
        source: Optional[str] = None,
        source_job_id: Optional[str] = None,
        company: Optional[str] = None,
        role: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if user has already applied to this job (exact or cross-platform duplicate).
        
        Returns:
            Tuple of (is_duplicate, reason)
        """
        # 1. Exact job ID check if job_id is provided
        if job_id:
            result = await db.execute(
                select(Application).where(
                    and_(
                        Application.user_id == user_id,
                        Application.job_id == job_id,
                        Application.status.in_(["applied", "interview", "ready", "offer", "review"])
                    )
                )
            )
            existing_app = result.scalar_one_or_none()
            if existing_app:
                applied_str = existing_app.applied_date.strftime("%Y-%m-%d") if existing_app.applied_date else "previously"
                return True, f"Skipped — already applied on {applied_str} (Status: {existing_app.status.upper()})"

        # 2. Exact source + source_job_id check
        if source and source_job_id:
            job_res = await db.execute(
                select(Job).where(
                    and_(Job.source == source, Job.source_job_id == source_job_id)
                )
            )
            matched_job = job_res.scalar_one_or_none()
            if matched_job:
                app_res = await db.execute(
                    select(Application).where(
                        and_(Application.user_id == user_id, Application.job_id == matched_job.id)
                    )
                )
                existing = app_res.scalar_one_or_none()
                if existing:
                    applied_str = existing.applied_date.strftime("%Y-%m-%d") if existing.applied_date else "previously"
                    return True, f"Skipped — already applied on {applied_str}"

        # 3. Cross-platform duplicate check (Company + Role + Location)
        if company and role:
            # Query applications joined with jobs
            query = (
                select(Application, Job)
                .join(Job, Application.job_id == Job.id)
                .where(
                    and_(
                        Application.user_id == user_id,
                        Job.company.ilike(f"%{company.strip()}%"),
                        Job.role.ilike(f"%{role.strip()}%"),
                    )
                )
            )
            res = await db.execute(query)
            for app, j in res.all():
                # Compare similarity
                company_sim = SequenceMatcher(None, company.lower(), j.company.lower()).ratio()
                role_sim = SequenceMatcher(None, role.lower(), j.role.lower()).ratio()
                if company_sim > 0.8 and role_sim > 0.75:
                    applied_str = app.applied_date.strftime("%Y-%m-%d") if app.applied_date else "previously"
                    return True, f"Skipped — cross-platform duplicate from {j.source.upper()} applied on {applied_str}"

        return False, None

    async def find_potential_duplicates(
        self,
        db: AsyncSession,
        user_id: int,
        company: str,
        role: str,
        location: Optional[str] = None,
    ) -> List[dict]:
        """
        Find potential duplicate jobs across platforms for human review.
        """
        query = select(Job).where(
            and_(
                Job.company.ilike(f"%{company}%"),
                Job.role.ilike(f"%{role}%"),
            )
        )
        result = await db.execute(query)
        jobs = result.scalars().all()

        duplicates = []
        for job in jobs:
            app_res = await db.execute(
                select(Application).where(
                    and_(Application.user_id == user_id, Application.job_id == job.id)
                )
            )
            app = app_res.scalar_one_or_none()
            duplicates.append({
                "job_id": job.id,
                "source": job.source,
                "company": job.company,
                "role": job.role,
                "location": job.location,
                "has_applied": app is not None,
                "application_status": app.status if app else None,
            })

        return duplicates


class RecruiterDeduplicator:
    """Service for preventing duplicate recruiter contacts and spam."""

    async def can_contact_recruiter(
        self,
        db: AsyncSession,
        user_id: int,
        recruiter_id: Optional[int] = None,
        recruiter_email: Optional[str] = None,
        platform_id: Optional[str] = None,
        company: Optional[str] = None,
        cooldown_days: int = 30,
    ) -> Tuple[bool, Optional[str]]:
        """
        Comprehensive check before contacting a recruiter.
        
        Returns:
            Tuple of (can_contact: bool, reason_if_blocked: str)
        """
        # 1. Check by recruiter ID if provided
        recruiter: Optional[Recruiter] = None
        if recruiter_id:
            res = await db.execute(
                select(Recruiter).where(
                    and_(Recruiter.user_id == user_id, Recruiter.id == recruiter_id)
                )
            )
            recruiter = res.scalar_one_or_none()
        elif recruiter_email:
            res = await db.execute(
                select(Recruiter).where(
                    and_(Recruiter.user_id == user_id, Recruiter.email == recruiter_email)
                )
            )
            recruiter = res.scalar_one_or_none()
        elif platform_id:
            res = await db.execute(
                select(Recruiter).where(
                    and_(Recruiter.user_id == user_id, Recruiter.platform_id == platform_id)
                )
            )
            recruiter = res.scalar_one_or_none()

        if recruiter:
            # Check DO NOT CONTACT safety lock
            if recruiter.status == RecruiterStatusEnum.DO_NOT_CONTACT:
                return False, "Skipped — recruiter is marked as 'DO NOT CONTACT'."

            # Check if recruiter has already replied / interview scheduled
            if recruiter.status in [RecruiterStatusEnum.REPLIED, RecruiterStatusEnum.INTERESTED, RecruiterStatusEnum.INTERVIEW]:
                return False, f"Skipped — recruiter conversation active (Status: {recruiter.status.upper()})."

            # Check cooldown period since last contact
            if recruiter.last_contact_date:
                days_since = (datetime.utcnow() - recruiter.last_contact_date).days
                if days_since < cooldown_days:
                    return False, f"Skipped — recruiter already contacted {days_since} days ago (cooldown {cooldown_days} days)."

        # Check if multiple recruiters at the same company have been contacted recently
        if company:
            company_res = await db.execute(
                select(Recruiter).where(
                    and_(
                        Recruiter.user_id == user_id,
                        Recruiter.company.ilike(f"%{company.strip()}%"),
                        Recruiter.status.in_(["contacted", "message_ready", "replied"]),
                        Recruiter.last_contact_date >= datetime.utcnow() - timedelta(days=7)
                    )
                )
            )
            recent_company_contacts = company_res.scalars().all()
            if len(recent_company_contacts) >= 3:
                return False, f"Skipped — already contacted {len(recent_company_contacts)} recruiters at {company} within last 7 days."

        return True, None

    async def mark_as_do_not_contact(
        self,
        db: AsyncSession,
        user_id: int,
        recruiter_id: int,
        reason: Optional[str] = None,
    ) -> bool:
        """Mark a recruiter as 'DO NOT CONTACT'."""
        res = await db.execute(
            select(Recruiter).where(
                and_(Recruiter.user_id == user_id, Recruiter.id == recruiter_id)
            )
        )
        recruiter = res.scalar_one_or_none()
        if recruiter:
            recruiter.status = RecruiterStatusEnum.DO_NOT_CONTACT
            recruiter.notes = f"Marked Do Not Contact: {reason or 'Candidate preference'}"
            await db.commit()
            return True
        return False

    async def check_message_duplicate(
        self,
        db: AsyncSession,
        user_id: int,
        recruiter_id: int,
        content: str,
    ) -> Tuple[bool, Optional[str]]:
        """Check if an identical message has already been sent to this recruiter."""
        res = await db.execute(
            select(Message).where(
                and_(Message.user_id == user_id, Message.recruiter_id == recruiter_id)
            ).order_by(Message.created_at.desc())
        )
        messages = res.scalars().all()

        for msg in messages:
            similarity = SequenceMatcher(None, content.strip(), msg.content.strip()).ratio()
            if similarity > 0.85:
                sent_str = msg.sent_date.strftime("%Y-%m-%d") if msg.sent_date else "previously"
                return True, f"Identical message already sent on {sent_str}."

        return False, None


job_deduplicator = JobDeduplicator()
recruiter_deduplicator = RecruiterDeduplicator()
