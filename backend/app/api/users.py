"""User and profile management endpoints."""
import json
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_or_create_demo_user
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models import CandidateProfile, ConnectedAccount, Resume, User
from app.schemas import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    ConnectedAccountResponse,
    LoginRequest,
    RegisterRequest,
    ResumeResponse,
    TokenResponse,
    UserResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email,
        username=request.username,
        hashed_password=get_password_hash(request.password),
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Create profile
    profile = CandidateProfile(
        user_id=user.id,
        full_name=request.full_name or request.username,
        email=request.email,
        degree="Bachelor of Computer Applications (BCA)",
        skills=json.dumps(["Python", "SQL", "HTML", "CSS", "JavaScript", "React", "Django", "Flask", "Power BI", "Pandas", "NumPy"]),
        job_types=json.dumps(["internship", "fresher"]),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and obtain JWT tokens."""
    res = await db.execute(select(User).where(User.email == request.email))
    user = res.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        # If demo login attempted with default credentials
        if request.email in ["sadhanakumari181106@gmail.com", "sadhna@jobhunt.ai", "demo@jobhunt-ai.com"]:
            user = await get_or_create_demo_user(db)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.get("/profile", response_model=CandidateProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get candidate profile."""
    res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    if not profile:
        await get_or_create_demo_user(db)
        res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
        profile = res.scalar_one_or_none()

    # Parse JSON fields for response
    return CandidateProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name,
        email=profile.email,
        phone=profile.phone,
        city=profile.city,
        preferred_locations=json.loads(profile.preferred_locations) if profile.preferred_locations else None,
        degree=profile.degree,
        college=profile.college,
        graduation_year=profile.graduation_year,
        skills=json.loads(profile.skills) if profile.skills else None,
        target_roles=json.loads(profile.target_roles) if profile.target_roles else None,
        projects=json.loads(profile.projects) if profile.projects else None,
        certifications=json.loads(profile.certifications) if profile.certifications else None,
        experience=json.loads(profile.experience) if profile.experience else None,
        portfolio_url=profile.portfolio_url,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        preferred_salary=profile.preferred_salary,
        preferred_stipend=profile.preferred_stipend,
        work_type=profile.work_type,
        job_types=json.loads(profile.job_types) if profile.job_types else None,
        availability=profile.availability,
        about=profile.about,
    )


@router.put("/profile", response_model=CandidateProfileResponse)
async def update_profile(
    update_data: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update candidate profile."""
    res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    data = update_data.model_dump(exclude_unset=True)
    for field, val in data.items():
        if val is not None:
            if field in ["skills", "target_roles", "preferred_locations", "projects", "certifications", "experience", "job_types"]:
                setattr(profile, field, json.dumps(val))
            else:
                setattr(profile, field, val)

    profile.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(profile)

    return await get_profile(current_user, db)


@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    version_name: Optional[str] = "Software Developer",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload and parse candidate resume."""
    filename = file.filename or "resume.pdf"
    content = await file.read()
    file_size = len(content)

    # Parsed content placeholder
    parsed_info = {
        "candidate_name": "Sadhna",
        "degree": "Bachelor of Computer Applications (BCA)",
        "skills_extracted": [
            "Python", "SQL", "MySQL", "PostgreSQL", "Pandas", "NumPy", "Power BI",
            "HTML5", "CSS3", "JavaScript", "Flutter", "Dart", "Firebase", "AI/ML"
        ],
        "projects_count": 4,
        "education": "Maharishi Dayanand University, Graduation: 2027",
    }

    resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_path=f"uploads/{filename}",
        version_name=version_name,
        is_default=True,
        file_size=file_size,
        parsed_content=json.dumps(parsed_info),
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return {
        "message": f"Resume '{filename}' uploaded successfully for version '{version_name}'",
        "resume_id": resume.id,
        "parsed_content": parsed_info,
    }


@router.get("/resumes")
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all user resume versions."""
    res = await db.execute(select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()))
    resumes = res.scalars().all()

    if not resumes:
        # Default mock resume version
        return [
            {
                "id": 1,
                "version_name": "Software & Data Analyst",
                "filename": "Sadhna_Resume_2026.pdf",
                "is_default": True,
                "uploaded_at": datetime.utcnow().isoformat(),
                "file_size": 142800,
                "parsed_content": {
                    "degree": "BCA (2027)",
                    "primary_skills": ["Python", "SQL", "Power BI", "Pandas", "Flutter", "AI/ML"],
                }
            },
            {
                "id": 2,
                "version_name": "AI/ML & Python Developer",
                "filename": "Sadhna_AIML_Resume.pdf",
                "is_default": False,
                "uploaded_at": datetime.utcnow().isoformat(),
                "file_size": 139500,
                "parsed_content": {
                    "degree": "BCA (2027)",
                    "primary_skills": ["Python", "AI/ML", "Pandas", "NumPy", "Flask", "Django"],
                }
            }
        ]

    return [
        {
            "id": r.id,
            "version_name": r.version_name,
            "filename": r.filename,
            "is_default": r.is_default,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "file_size": r.file_size,
            "parsed_content": json.loads(r.parsed_content) if r.parsed_content else None,
        }
        for r in resumes
    ]


@router.get("/connected-accounts", response_model=List[ConnectedAccountResponse])
async def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List connected platform accounts (LinkedIn, Naukri, Internshala, Gmail)."""
    res = await db.execute(select(ConnectedAccount).where(ConnectedAccount.user_id == current_user.id))
    accounts = res.scalars().all()

    if not accounts:
        await get_or_create_demo_user(db)
        res = await db.execute(select(ConnectedAccount).where(ConnectedAccount.user_id == current_user.id))
        accounts = res.scalars().all()

    return accounts


@router.post("/connected-accounts/{platform}/connect")
async def connect_account(
    platform: str,
    account_email: Optional[str] = "sadhanakumari181106@gmail.com",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Simulate secure OAuth account connection without password storage."""
    platform = platform.lower()
    if platform not in ["linkedin", "naukri", "internshala", "gmail"]:
        raise HTTPException(status_code=400, detail="Unsupported platform")

    res = await db.execute(
        select(ConnectedAccount).where(
            and_(ConnectedAccount.user_id == current_user.id, ConnectedAccount.platform == platform)
        )
    )
    acct = res.scalar_one_or_none()

    if not acct:
        acct = ConnectedAccount(
            user_id=current_user.id,
            platform=platform,
            is_connected=True,
            account_email=account_email,
            connected_at=datetime.utcnow(),
        )
        db.add(acct)
    else:
        acct.is_connected = True
        acct.account_email = account_email
        acct.connected_at = datetime.utcnow()

    await db.commit()
    return {"status": "connected", "platform": platform, "account_email": account_email}


@router.post("/connected-accounts/{platform}/disconnect")
async def disconnect_account(
    platform: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect account."""
    platform = platform.lower()
    res = await db.execute(
        select(ConnectedAccount).where(
            and_(ConnectedAccount.user_id == current_user.id, ConnectedAccount.platform == platform)
        )
    )
    acct = res.scalar_one_or_none()
    if acct:
        acct.is_connected = False
        await db.commit()

    return {"status": "disconnected", "platform": platform}
