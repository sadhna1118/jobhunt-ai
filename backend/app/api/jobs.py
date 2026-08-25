"""Job search and discovery endpoints."""
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.integrations.adapters import MockJobSourceAdapter
from app.models import CandidateProfile, Job, JobMatch, User
from app.schemas import JobMatchResponse, JobResponse
from app.services.ai_service import ai_service
from app.services.job_matcher import job_matcher
from app.tasks.automation import execute_automation_workflow

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/search")
async def search_jobs(
    q: Optional[str] = None,
    source: Optional[str] = None,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    min_score: Optional[float] = None,
    eligible_only: Optional[bool] = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search discovered jobs with comprehensive filtering."""
    # Ensure jobs exist; if empty, run initial seed
    count_res = await db.execute(select(Job))
    if not count_res.first():
        await execute_automation_workflow(current_user.id, run_time="initial_seed")

    query = select(Job, JobMatch).outerjoin(
        JobMatch, and_(JobMatch.job_id == Job.id, JobMatch.user_id == current_user.id)
    )

    conditions = []
    if q:
        conditions.append(
            or_(
                Job.role.ilike(f"%{q}%"),
                Job.company.ilike(f"%{q}%"),
                Job.skills_required.ilike(f"%{q}%"),
                Job.description.ilike(f"%{q}%"),
            )
        )
    if source and source != "all":
        conditions.append(Job.source == source)
    if job_type and job_type != "all":
        conditions.append(Job.job_type == job_type)
    if location and location != "all":
        conditions.append(Job.location.ilike(f"%{location}%"))
    if eligible_only:
        conditions.append(JobMatch.eligibility_status.in_(["eligible", "possibly_eligible"]))
    if min_score:
        conditions.append(JobMatch.match_score >= min_score)

    if conditions:
        query = query.where(and_(*conditions))

    # Order by match score descending
    query = query.order_by(JobMatch.match_score.desc().nullslast(), Job.posted_date.desc())

    # Pagination
    offset = (page - 1) * limit
    paged_query = query.offset(offset).limit(limit)

    results = await db.execute(paged_query)
    rows = results.all()

    items = []
    for job, match in rows:
        skills = []
        if job.skills_required:
            try:
                skills = json.loads(job.skills_required)
            except Exception:
                skills = [s.strip() for s in job.skills_required.split(",")]

        items.append({
            "id": job.id,
            "source": job.source,
            "source_job_id": job.source_job_id,
            "company": job.company,
            "role": job.role,
            "location": job.location,
            "job_type": job.job_type,
            "experience_required": job.experience_required,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "stipend_min": job.stipend_min,
            "stipend_max": job.stipend_max,
            "skills_required": skills,
            "description": job.description,
            "application_url": job.application_url,
            "posted_date": job.posted_date.isoformat() if job.posted_date else None,
            "deadline": job.deadline.isoformat() if job.deadline else None,
            "recruiter_name": job.recruiter_name,
            "recruiter_id": job.recruiter_id,
            "recruiter_email": job.recruiter_email,
            "company_url": job.company_url,
            "is_available": job.is_available,
            "match_score": match.match_score if match else 80.0,
            "eligibility_status": match.eligibility_status if match else "eligible",
            "eligibility_reason": match.eligibility_reason if match else "Meets qualification criteria",
        })

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": len(items),
    }


@router.get("/trending")
async def get_trending_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get top 5 highest matching opportunities."""
    res = await db.execute(
        select(Job, JobMatch)
        .join(JobMatch, JobMatch.job_id == Job.id)
        .where(JobMatch.user_id == current_user.id)
        .order_by(JobMatch.match_score.desc())
        .limit(6)
    )
    rows = res.all()

    trending = []
    for job, match in rows:
        trending.append({
            "id": job.id,
            "role": job.role,
            "company": job.company,
            "location": job.location,
            "source": job.source,
            "stipend_min": job.stipend_min,
            "match_score": match.match_score,
            "eligibility_status": match.eligibility_status,
        })
    return trending


@router.get("/{job_id}")
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full job details."""
    res = await db.execute(select(Job).where(Job.id == job_id))
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    match_res = await db.execute(
        select(JobMatch).where(and_(JobMatch.job_id == job.id, JobMatch.user_id == current_user.id))
    )
    match = match_res.scalar_one_or_none()

    skills = []
    if job.skills_required:
        try:
            skills = json.loads(job.skills_required)
        except Exception:
            skills = [s.strip() for s in job.skills_required.split(",")]

    return {
        "id": job.id,
        "source": job.source,
        "source_job_id": job.source_job_id,
        "company": job.company,
        "role": job.role,
        "location": job.location,
        "job_type": job.job_type,
        "experience_required": job.experience_required,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "stipend_min": job.stipend_min,
        "stipend_max": job.stipend_max,
        "skills_required": skills,
        "description": job.description,
        "application_url": job.application_url,
        "posted_date": job.posted_date.isoformat() if job.posted_date else None,
        "deadline": job.deadline.isoformat() if job.deadline else None,
        "recruiter_name": job.recruiter_name,
        "recruiter_id": job.recruiter_id,
        "recruiter_email": job.recruiter_email,
        "company_url": job.company_url,
        "is_available": job.is_available,
        "match_score": match.match_score if match else 80.0,
        "eligibility_status": match.eligibility_status if match else "eligible",
        "eligibility_reason": match.eligibility_reason if match else "Matches profile criteria",
    }


@router.get("/{job_id}/match")
async def get_job_match(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed AI match score breakdown and advice."""
    res = await db.execute(select(Job).where(Job.id == job_id))
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()

    skills = []
    if job.skills_required:
        try:
            skills = json.loads(job.skills_required)
        except Exception:
            skills = []

    profile_dict = {
        "full_name": profile.full_name if profile else "Sadhna",
        "degree": profile.degree if profile else "BCA",
        "skills": profile.skills if profile else "Python, SQL, React, Flutter, Pandas, NumPy, Power BI",
        "target_roles": profile.target_roles if profile else None,
        "preferred_locations": profile.preferred_locations if profile else ["New Delhi", "Remote"],
    }

    score, details = job_matcher.calculate_match_score(profile_dict, {
        "role": job.role,
        "skills_required": skills,
        "job_type": job.job_type,
        "location": job.location,
        "description": job.description,
        "experience_required": job.experience_required,
        "stipend_min": job.stipend_min,
        "posted_date": job.posted_date,
    })

    elig_status, elig_reason = job_matcher.check_eligibility(profile_dict, {
        "role": job.role,
        "skills_required": skills,
        "job_type": job.job_type,
        "location": job.location,
        "description": job.description,
        "experience_required": job.experience_required,
    })

    # AI Deep Analysis
    ai_analysis = await ai_service.generate_match_analysis(
        profile_dict, job.description or "", job.role, job.company
    )

    return {
        "job_id": job.id,
        "role": job.role,
        "company": job.company,
        "match_score": score,
        "eligibility_status": elig_status,
        "eligibility_reason": elig_reason,
        "breakdown": details,
        "ai_analysis": ai_analysis,
    }


@router.post("/seed-demo")
async def seed_demo_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Seed 100 mock jobs and recruiters into the database for demo testing."""
    report = await execute_automation_workflow(current_user.id, run_time="demo_seed")
    return {"message": "Demo data successfully seeded", "report": report}
