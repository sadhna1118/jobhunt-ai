"""Automation tasks and daily workflow execution engine."""
import asyncio
import json
import logging
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.celery_app import app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.integrations.adapters import get_adapters
from app.models import (
    Application,
    ApprovalQueue,
    AutomationRun,
    AutomationSettings,
    CandidateProfile,
    Job,
    JobMatch,
    Message,
    Notification,
    Recruiter,
    RecruiterStatusEnum,
    User,
)
from app.services.deduplicator import job_deduplicator, recruiter_deduplicator
from app.services.job_matcher import job_matcher
from app.services.message_generator import message_generator

logger = logging.getLogger(__name__)


async def execute_automation_workflow(
    user_id: int,
    run_time: str = "manual",  # "05:00", "21:00", or "manual"
) -> Dict[str, Any]:
    """
    Complete 11-step automation workflow executed at 5:00 AM & 9:00 PM IST or on-demand.
    
    Steps:
    1. Search new jobs from configured sources
    2. Normalize job data into standard format
    3. Deduplicate across platforms
    4. Check candidate eligibility
    5. Calculate AI match score (0-100)
    6. Filter unsuitable jobs (< threshold)
    7. Check previous applications
    8. Identify relevant recruiters
    9. Check recruiter contact history & cooldown
    10. Prepare or execute permitted applications
    11. Prepare/send permitted recruiter outreach (max 5 new emails per run)
    12. Generate daily report & notifications
    """
    logger.info(f"Starting JOBHUNT AI automation workflow for user {user_id} (Run: {run_time})")
    start_time = datetime.utcnow()

    async with AsyncSessionLocal() as db:
        # Get user profile & settings
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user:
            logger.error(f"User {user_id} not found")
            return {"error": "User not found"}

        prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
        profile = prof_res.scalar_one_or_none()
        
        settings_res = await db.execute(select(AutomationSettings).where(AutomationSettings.user_id == user_id))
        user_settings = settings_res.scalar_one_or_none()

        min_score = user_settings.min_match_score if user_settings else settings.MIN_MATCH_SCORE
        daily_app_limit = user_settings.daily_application_limit if user_settings else settings.DAILY_APPLICATION_LIMIT
        daily_email_limit = user_settings.daily_email_limit if user_settings else settings.DAILY_EMAIL_LIMIT
        auto_apply = user_settings.auto_apply_enabled if user_settings else False
        auto_message = user_settings.auto_message_enabled if user_settings else False

        profile_dict = {
            "full_name": profile.full_name if profile else "Sadhna",
            "degree": profile.degree if profile else "Bachelor of Computer Applications (BCA)",
            "college": profile.college if profile else "Maharishi Dayanand University",
            "graduation_year": profile.graduation_year if profile else 2027,
            "skills": profile.skills if profile else "Python, SQL, HTML, CSS, JavaScript, React, Django, Flask, Power BI, Pandas, NumPy, AI/ML, Flutter, Firebase",
            "target_roles": profile.target_roles if profile else None,
            "preferred_locations": profile.preferred_locations if profile else ["New Delhi", "Remote"],
            "preferred_stipend": profile.preferred_stipend if profile else 5000,
            "phone": profile.phone if profile else "+91 7428889800",
            "email": profile.email if profile else "sadhanakumari181106@gmail.com",
            "github_url": profile.github_url if profile else "github.com/sadhna1118",
            "linkedin_url": profile.linkedin_url if profile else "linkedin.com/in/sadhna1615b333b",
        }

        # STEP 1: Search new jobs across all adapters
        adapters = get_adapters()
        raw_jobs = []
        for adapter in adapters:
            try:
                found = await adapter.search_jobs()
                raw_jobs.extend(found)
            except Exception as e:
                logger.error(f"Error fetching jobs from {adapter.source_name}: {e}")

        jobs_discovered = len(raw_jobs)
        eligible_count = 0
        high_match_count = 0
        applications_submitted = 0
        applications_skipped = 0
        hr_messages_sent = 0
        hr_messages_skipped = 0
        skipped_hr_reasons = []
        top_opportunities = []

        # Process each job
        for norm_job in raw_jobs:
            # STEP 2 & 3: Normalize and Check existing job in DB
            job_select = await db.execute(
                select(Job).where(and_(Job.source == norm_job.source, Job.source_job_id == norm_job.job_id))
            )
            db_job = job_select.scalar_one_or_none()

            if not db_job:
                # Parse dates safely
                posted_dt = None
                if norm_job.posted_date:
                    try:
                        posted_dt = datetime.fromisoformat(norm_job.posted_date.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        posted_dt = datetime.utcnow()

                deadline_d = None
                if norm_job.deadline:
                    try:
                        deadline_d = date.fromisoformat(norm_job.deadline)
                    except Exception:
                        deadline_d = None

                db_job = Job(
                    source=norm_job.source,
                    source_job_id=norm_job.job_id,
                    company=norm_job.company,
                    role=norm_job.role,
                    location=norm_job.location,
                    job_type=norm_job.job_type,
                    experience_required=norm_job.experience,
                    salary_min=norm_job.salary_min,
                    salary_max=norm_job.salary_max,
                    stipend_min=norm_job.stipend_min,
                    stipend_max=norm_job.stipend_max,
                    skills_required=json.dumps(norm_job.skills or []),
                    description=norm_job.description,
                    application_url=norm_job.application_url,
                    posted_date=posted_dt or datetime.utcnow(),
                    deadline=deadline_d,
                    recruiter_name=norm_job.recruiter,
                    recruiter_id=norm_job.recruiter_id,
                    recruiter_email=norm_job.recruiter_email,
                    company_url=norm_job.company_url,
                )
                db.add(db_job)
                await db.flush()
                await db.refresh(db_job)

            # STEP 4: Check Eligibility
            elig_status, elig_reason = job_matcher.check_eligibility(profile_dict, norm_job.__dict__)
            if elig_status in ["eligible", "possibly_eligible"]:
                eligible_count += 1

            # STEP 5: Calculate Match Score
            score, details = job_matcher.calculate_match_score(profile_dict, norm_job.__dict__)

            # Update or create JobMatch record
            match_res = await db.execute(
                select(JobMatch).where(and_(JobMatch.user_id == user_id, JobMatch.job_id == db_job.id))
            )
            job_match = match_res.scalar_one_or_none()
            if not job_match:
                job_match = JobMatch(
                    user_id=user_id,
                    job_id=db_job.id,
                    eligibility_status=elig_status,
                    eligibility_reason=elig_reason,
                    match_score=score,
                    skill_match=details.get("skill_match"),
                    education_match=details.get("education_match"),
                    experience_match=details.get("experience_match"),
                    role_match=details.get("role_match"),
                    location_match=details.get("location_match"),
                    salary_match=details.get("salary_match"),
                    freshness=details.get("freshness"),
                    match_details=json.dumps(details),
                )
                db.add(job_match)
            else:
                job_match.match_score = score
                job_match.eligibility_status = elig_status
                job_match.eligibility_reason = elig_reason

            if score >= min_score:
                high_match_count += 1
                if len(top_opportunities) < 5:
                    top_opportunities.append({
                        "job_id": db_job.id,
                        "role": db_job.role,
                        "company": db_job.company,
                        "location": db_job.location,
                        "match_score": score,
                        "eligibility": elig_status,
                    })

            # STEP 6 & 7: Check previous applications & Duplicate prevention
            is_dup, dup_reason = await job_deduplicator.is_duplicate_application(
                db, user_id, job_id=db_job.id, company=db_job.company, role=db_job.role
            )

            if is_dup:
                applications_skipped += 1
                continue

            # STEP 8 & 9: Recruiter identification and deduplication
            if norm_job.recruiter:
                rec_res = await db.execute(
                    select(Recruiter).where(
                        and_(Recruiter.user_id == user_id, Recruiter.company == norm_job.company)
                    )
                )
                recruiter = rec_res.scalar_one_or_none()
                if not recruiter:
                    recruiter = Recruiter(
                        user_id=user_id,
                        name=norm_job.recruiter,
                        email=norm_job.recruiter_email,
                        company=norm_job.company,
                        role="HR / Hiring Manager",
                        platform=norm_job.source,
                        platform_id=norm_job.recruiter_id,
                        status=RecruiterStatusEnum.NOT_CONTACTED,
                    )
                    db.add(recruiter)
                    await db.flush()
                    await db.refresh(recruiter)

                # Check if recruiter can be contacted (max 5 new emails per run)
                can_contact, block_reason = await recruiter_deduplicator.can_contact_recruiter(
                    db, user_id, recruiter_id=recruiter.id, recruiter_email=norm_job.recruiter_email, company=norm_job.company
                )

                if can_contact and hr_messages_sent < daily_email_limit and score >= min_score:
                    # Generate personalized outreach message
                    msg_text = message_generator.generate_linkedin_message(
                        candidate_name=profile_dict["full_name"],
                        recruiter_name=recruiter.name,
                        company=recruiter.company,
                        role=db_job.role,
                        run_time=run_time,
                    )
                    
                    # Queue for approval or send
                    queue_item = ApprovalQueue(
                        user_id=user_id,
                        action_type="hr_message",
                        job_id=db_job.id,
                        recruiter_id=recruiter.id,
                        data=json.dumps({
                            "message": msg_text,
                            "recruiter_name": recruiter.name,
                            "company": recruiter.company,
                            "role": db_job.role,
                            "platform": norm_job.source,
                            "email": recruiter.email,
                        }),
                        status="pending" if not auto_message else "approved",
                        priority=int(score),
                    )
                    db.add(queue_item)
                    hr_messages_sent += 1
                elif not can_contact:
                    hr_messages_skipped += 1
                    if block_reason and block_reason not in skipped_hr_reasons:
                        skipped_hr_reasons.append(f"{recruiter.company} ({recruiter.name}): {block_reason}")

            # STEP 10: Queue application if high score and within daily limit
            if score >= min_score and applications_submitted < daily_app_limit:
                cover_letter_text = message_generator.generate_cover_letter(
                    profile_dict, db_job.company, db_job.role, db_job.description, norm_job.skills
                )

                app_queue = ApprovalQueue(
                    user_id=user_id,
                    action_type="application",
                    job_id=db_job.id,
                    data=json.dumps({
                        "role": db_job.role,
                        "company": db_job.company,
                        "match_score": score,
                        "cover_letter": cover_letter_text,
                        "application_url": db_job.application_url,
                    }),
                    status="pending" if not auto_apply else "approved",
                    priority=int(score),
                )
                db.add(app_queue)

                # Also create Application record in 'ready' or 'saved' state
                app_check = await db.execute(
                    select(Application).where(and_(Application.user_id == user_id, Application.job_id == db_job.id))
                )
                if not app_check.scalar_one_or_none():
                    new_app = Application(
                        user_id=user_id,
                        job_id=db_job.id,
                        status="ready" if not auto_apply else "applied",
                        match_score=score,
                        cover_letter=cover_letter_text,
                        application_url=db_job.application_url,
                        applied_date=datetime.utcnow() if auto_apply else None,
                    )
                    db.add(new_app)

                applications_submitted += 1

        # STEP 11 & 12: Generate Report and Audit Log
        end_time = datetime.utcnow()
        report_data = {
            "run_time": run_time,
            "jobs_discovered": jobs_discovered,
            "eligible": eligible_count,
            "high_match": high_match_count,
            "applications_submitted": applications_submitted,
            "applications_skipped": applications_skipped,
            "hr_messages_sent": hr_messages_sent,
            "hr_messages_skipped": hr_messages_skipped,
            "reasons_for_skipped_hrs": skipped_hr_reasons[:5],
            "top_opportunities": top_opportunities,
            "potential_interviews": 0,
            "actions_requiring_approval": applications_submitted + hr_messages_sent,
        }

        automation_run = AutomationRun(
            user_id=user_id,
            run_time=run_time,
            start_time=start_time,
            end_time=end_time,
            status="success",
            jobs_discovered=jobs_discovered,
            jobs_eligible=eligible_count,
            jobs_high_match=high_match_count,
            applications_submitted=applications_submitted,
            applications_skipped=applications_skipped,
            hr_messages_sent=hr_messages_sent,
            hr_messages_skipped=hr_messages_skipped,
            report=json.dumps(report_data),
        )
        db.add(automation_run)

        # Create user notification
        time_label = "05:00 AM" if run_time in ["05:00", "morning"] else ("09:00 PM" if run_time in ["21:00", "evening"] else "On-Demand")
        notification = Notification(
            user_id=user_id,
            title=f"JOBHUNT AI — {time_label} Run Report",
            message=(
                f"{jobs_discovered} jobs discovered | {eligible_count} eligible | {high_match_count} high-match. "
                f"{applications_submitted} applications queued | {hr_messages_sent} HR messages prepared."
            ),
            notification_type="success",
        )
        db.add(notification)

        await db.commit()
        logger.info(f"Completed automation run. Report: {report_data}")
        return report_data


@app.task(bind=True, name="app.tasks.automation.run_daily_automation")
def run_daily_automation(self, run_type: str = "morning"):
    """Celery task entrypoint."""
    run_time = "05:00" if run_type == "morning" else "21:00"
    # Execute async workflow
    loop = asyncio.get_event_loop()
    if loop.is_running():
        return {"status": "dispatched", "run_time": run_time}
    else:
        return asyncio.run(execute_automation_workflow(user_id=1, run_time=run_time))
