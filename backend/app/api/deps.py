"""Shared API dependencies: authentication, authorization, and demo fallback."""
import json
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token, get_password_hash
from app.models import AutomationSettings, CandidateProfile, ConnectedAccount, User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login", auto_error=False)


async def get_or_create_demo_user(db: AsyncSession) -> User:
    """Ensure the default profile for Sadhna exists in database."""
    result = await db.execute(select(User).where(User.username == "sadhna"))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email="sadhanakumari181106@gmail.com",
            username="sadhna",
            hashed_password=get_password_hash("sadhna123"),
            is_active=True,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        # Create Sadhna's profile with accurate resume data
        skills_list = [
            "Python", "SQL", "MySQL", "PostgreSQL", "Pandas", "NumPy", "Data Cleaning",
            "Exploratory Data Analysis (EDA)", "Power BI", "DAX", "Interactive Dashboards",
            "KPIs", "Microsoft Excel", "Git", "GitHub", "VS Code", "HTML5", "CSS3",
            "JavaScript", "Flask", "Django", "React", "Flutter", "Dart", "Firebase",
            "REST APIs", "AI/ML fundamentals"
        ]

        target_roles = [
            "Software Developer Intern", "Python Developer Intern", "Backend Developer Intern",
            "Frontend Developer Intern", "Full Stack Developer Intern", "Web Developer Intern",
            "Data Analyst Intern", "Data Analyst Fresher", "Python Developer Fresher",
            "AI/ML Intern", "AI Engineer Intern", "Machine Learning Intern",
            "Software Engineer Fresher", "Technical/IT Intern"
        ]

        projects = [
            {
                "title": "FemCare – Women's Health & Wellness App",
                "tech_stack": "Flutter, Dart, Firebase, AI/ML, REST API",
                "description": "Built a Flutter-based women's health app featuring period tracking, cycle prediction, mood/symptom tracking, notifications, and personalized AI wellness support.",
                "github": "github.com/sadhna1118/Femcare"
            },
            {
                "title": "Netflix Data Analysis",
                "tech_stack": "Python, Pandas, NumPy, Matplotlib",
                "description": "Performed end-to-end data cleaning and EDA on Netflix datasets to extract trends in genres, ratings, and release years with actionable visualizations."
            },
            {
                "title": "Diabetes Indicator Dashboard",
                "tech_stack": "Power BI, Data Modeling, DAX",
                "description": "Designed an interactive Power BI dashboard featuring dynamic charts and custom KPIs to visualize critical healthcare indicators and patient demographics."
            },
            {
                "title": "Digital Trust & Safety Web Application",
                "tech_stack": "AI Integration, Web Tech",
                "description": "Engineered a responsive web application utilizing AI to effectively identify and mitigate fraudulent online behaviors. Awarded 2nd Prize at Dell Technologies AI Make-a-thon."
            }
        ]

        certifications = [
            "2nd Prize Winner, National AI Make-a-thon — Dell Technologies & Learning Links Foundation (2025)",
            "Participant, BITBOX 6.0 — Google Developer Groups (GDG) (2026)",
            "Artificial Intelligence Certification — Infosys Springboard (2026)",
            "AI & Employability Skills Certification — Dell Technologies (2025)",
            "80-Hour Industrial Training (MS Office, Tally Prime, GST) — ICA Edu Skills (2024)"
        ]

        profile = CandidateProfile(
            user_id=user.id,
            full_name="Sadhna",
            email="sadhanakumari181106@gmail.com",
            phone="+91 7428889800",
            city="New Delhi",
            preferred_locations=json.dumps(["New Delhi", "Remote", "Noida", "Gurgaon", "Bengaluru", "Pune"]),
            degree="Bachelor of Computer Applications (BCA)",
            college="Maharishi Dayanand University",
            graduation_year=2027,
            skills=json.dumps(skills_list),
            target_roles=json.dumps(target_roles),
            projects=json.dumps(projects),
            certifications=json.dumps(certifications),
            portfolio_url="linkedin.com/in/sadhna1615b333b",
            github_url="github.com/sadhna1118",
            linkedin_url="linkedin.com/in/sadhna1615b333b",
            preferred_salary=400000,
            preferred_stipend=10000,
            work_type="remote",
            job_types=json.dumps(["internship", "fresher"]),
            availability="Immediate",
            about=(
                "Detail-oriented Computer Science student specializing in Data Analysis, SQL, Python, "
                "and Business Intelligence. Proven ability to clean complex datasets, write advanced SQL queries, "
                "build machine learning models, and develop interactive Power BI dashboards."
            ),
        )
        db.add(profile)

        # Automation Settings
        settings_obj = AutomationSettings(
            user_id=user.id,
            is_enabled=True,
            morning_time="05:00",
            evening_time="21:00",
            daily_application_limit=10,
            daily_email_limit=5,
            min_match_score=75.0,
            enabled_sources=json.dumps(["linkedin", "naukri", "internshala", "company"]),
            target_job_types=json.dumps(["internship", "fresher"]),
            target_locations=json.dumps(["New Delhi", "Remote"]),
            auto_apply_enabled=False,
            auto_message_enabled=False,
        )
        db.add(settings_obj)

        # Connected Accounts defaults
        for platform, acct_email, connected in [
            ("linkedin", "sadhna@linkedin.com", True),
            ("gmail", "sadhanakumari181106@gmail.com", True),
            ("naukri", "sadhanakumari181106@gmail.com", False),
            ("internshala", "sadhanakumari181106@gmail.com", False),
        ]:
            conn = ConnectedAccount(
                user_id=user.id,
                platform=platform,
                account_email=acct_email if connected else None,
                is_connected=connected,
            )
            db.add(conn)

        await db.commit()
        await db.refresh(user)

    return user


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the currently authenticated user with demo fallback."""
    if token:
        payload = decode_token(token)
        if payload and payload.get("type") == "access":
            user_id = int(payload.get("sub", "0"))
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            if user and user.is_active:
                return user

    # Fallback to default user for seamless local development
    return await get_or_create_demo_user(db)