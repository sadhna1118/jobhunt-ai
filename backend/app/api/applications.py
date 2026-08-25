"""Application tracking and Kanban endpoints."""
import json
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Application, AutomationSettings, CandidateProfile, Job, JobMatch, User
from app.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.deduplicator import job_deduplicator
from app.services.message_generator import message_generator

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_applications(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all tracked job applications."""
    query = select(Application, Job).join(Job, Application.job_id == Job.id).where(
        Application.user_id == current_user.id
    )

    if status and status != "all":
        query = query.where(Application.status == status)

    query = query.order_by(Application.updated_at.desc())
    results = await db.execute(query)
    rows = results.all()

    items = []
    for app, job in rows:
        items.append({
            "id": app.id,
            "user_id": app.user_id,
            "job_id": app.job_id,
            "status": app.status,
            "match_score": app.match_score,
            "resume_used": app.resume_used,
            "cover_letter": app.cover_letter,
            "applied_date": app.applied_date.isoformat() if app.applied_date else None,
            "application_url": app.application_url or job.application_url,
            "response_date": app.response_date.isoformat() if app.response_date else None,
            "response_text": app.response_text,
            "notes": app.notes,
            "created_at": app.created_at.isoformat() if app.created_at else None,
            "job": {
                "id": job.id,
                "company": job.company,
                "role": job.role,
                "location": job.location,
                "source": job.source,
                "job_type": job.job_type,
                "stipend_min": job.stipend_min,
                "salary_min": job.salary_min,
                "application_url": job.application_url,
            }
        })

    return items


@router.get("/status/by-status")
async def get_applications_by_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get applications grouped by Kanban board columns."""
    statuses = ["saved", "review", "ready", "applied", "interview", "rejected", "offer"]
    grouped = {s: [] for s in statuses}

    query = select(Application, Job).join(Job, Application.job_id == Job.id).where(
        Application.user_id == current_user.id
    )
    res = await db.execute(query)
    for app, job in res.all():
        st = app.status.lower() if app.status else "saved"
        if st not in grouped:
            grouped[st] = []
        grouped[st].append({
            "id": app.id,
            "user_id": app.user_id,
            "job_id": app.job_id,
            "status": app.status,
            "match_score": app.match_score,
            "resume_used": app.resume_used,
            "cover_letter": app.cover_letter,
            "applied_date": app.applied_date.isoformat() if app.applied_date else None,
            "application_url": app.application_url or job.application_url,
            "notes": app.notes,
            "job": {
                "id": job.id,
                "company": job.company,
                "role": job.role,
                "location": job.location,
                "source": job.source,
                "job_type": job.job_type,
                "stipend_min": job.stipend_min,
                "salary_min": job.salary_min,
            }
        })

    return grouped


@router.post("/{job_id}")
async def create_application(
    job_id: int,
    payload: Optional[ApplicationCreate] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Apply to a job or save it to application tracker."""
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Duplicate check
    is_dup, dup_reason = await job_deduplicator.is_duplicate_application(
        db, current_user.id, job_id=job.id, company=job.company, role=job.role
    )
    if is_dup:
        raise HTTPException(status_code=400, detail=dup_reason)

    # Check daily limit
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count_res = await db.execute(
        select(func.count(Application.id)).where(
            and_(
                Application.user_id == current_user.id,
                Application.applied_date >= today_start,
            )
        )
    )
    applied_today = count_res.scalar_one() or 0
    if applied_today >= 10:
        raise HTTPException(
            status_code=400,
            detail="Daily application limit of 10 reached. To ensure quality, please queue in Review or Approval Center.",
        )

    # Generate cover letter if not provided
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()

    cover_letter = payload.cover_letter if (payload and payload.cover_letter) else message_generator.generate_cover_letter(
        {
            "full_name": profile.full_name if profile else "Sadhna",
            "degree": profile.degree if profile else "BCA",
            "skills": profile.skills if profile else "Python, SQL, React, Flutter, Pandas, NumPy, Power BI",
            "phone": profile.phone if profile else "+91 7428889800",
            "email": profile.email if profile else "sadhanakumari181106@gmail.com",
            "github_url": profile.github_url if profile else "github.com/sadhna1118",
        },
        job.company,
        job.role,
        job.description,
    )

    match_res = await db.execute(
        select(JobMatch).where(and_(JobMatch.job_id == job.id, JobMatch.user_id == current_user.id))
    )
    match = match_res.scalar_one_or_none()
    score = match.match_score if match else 85.0

    target_status = payload.status if (payload and payload.status) else "applied"

    app = Application(
        user_id=current_user.id,
        job_id=job.id,
        status=target_status,
        match_score=score,
        resume_used=payload.resume_used if (payload and payload.resume_used) else "Sadhna_Resume_2026.pdf",
        cover_letter=cover_letter,
        applied_date=datetime.utcnow() if target_status == "applied" else None,
        application_url=job.application_url,
        notes=payload.notes if payload else None,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)

    return {
        "message": f"Successfully applied to {job.role} at {job.company}!",
        "application_id": app.id,
        "status": app.status,
    }


@router.get("/{app_id}")
async def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single application details."""
    res = await db.execute(
        select(Application, Job).join(Job, Application.job_id == Job.id).where(
            and_(Application.id == app_id, Application.user_id == current_user.id)
        )
    )
    item = res.first()
    if not item:
        raise HTTPException(status_code=404, detail="Application not found")

    app, job = item
    return {
        "id": app.id,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "status": app.status,
        "match_score": app.match_score,
        "resume_used": app.resume_used,
        "cover_letter": app.cover_letter,
        "applied_date": app.applied_date.isoformat() if app.applied_date else None,
        "application_url": app.application_url or job.application_url,
        "notes": app.notes,
        "job": {
            "id": job.id,
            "company": job.company,
            "role": job.role,
            "location": job.location,
            "source": job.source,
            "stipend_min": job.stipend_min,
            "salary_min": job.salary_min,
            "description": job.description,
        }
    }


@router.put("/{app_id}")
async def update_application(
    app_id: int,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update application status (Kanban column move) or notes."""
    res = await db.execute(
        select(Application).where(and_(Application.id == app_id, Application.user_id == current_user.id))
    )
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if payload.status:
        app.status = payload.status
        if payload.status == "applied" and not app.applied_date:
            app.applied_date = datetime.utcnow()
    if payload.notes is not None:
        app.notes = payload.notes
    if payload.response_text is not None:
        app.response_text = payload.response_text
        app.response_date = datetime.utcnow()

    app.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(app)

    return {"message": "Application updated", "id": app.id, "status": app.status}
