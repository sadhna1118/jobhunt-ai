"""Job source adapters for LinkedIn, Naukri, Internshala, and Company career pages."""
import logging
import random
from datetime import datetime, timedelta
from typing import List, Optional

from app.integrations.base import BaseJobSourceAdapter, NormalizedJob

logger = logging.getLogger(__name__)


class LinkedInAdapter(BaseJobSourceAdapter):
    """LinkedIn Jobs compliant adapter."""

    source_name = "linkedin"

    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Search LinkedIn jobs using official API/compliant mechanisms."""
        logger.info("LinkedInAdapter.search_jobs called")
        return []

    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        return None


class NaukriAdapter(BaseJobSourceAdapter):
    """Naukri.com adapter."""

    source_name = "naukri"

    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Search Naukri for fresher and internship opportunities."""
        logger.info("NaukriAdapter.search_jobs called")
        return []

    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        return None


class InternshalaAdapter(BaseJobSourceAdapter):
    """Internshala adapter."""

    source_name = "internshala"

    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Search Internshala for tech internships."""
        logger.info("InternshalaAdapter.search_jobs called")
        return []

    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        return None


class CompanyCareerAdapter(BaseJobSourceAdapter):
    """Direct company career portals adapter."""

    source_name = "company"

    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Search verified company career portals."""
        logger.info("CompanyCareerAdapter.search_jobs called")
        return []

    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        return None


class MockJobSourceAdapter(BaseJobSourceAdapter):
    """
    Mock adapter for Demo Mode & Testing.
    Generates 100 realistic jobs across LinkedIn, Naukri, Internshala, and Company portals.
    """

    source_name = "demo"

    _companies = [
        "TechNova Solutions", "CloudSprint Systems", "DataVue Analytics", "WebCraft Labs",
        "CodeCrafters India", "InnovateHub", "PixelWorks Tech", "GreenByte Systems",
        "AlphaSoft AI", "BrightPath Infotech", "QuantumLeap Tech", "NexaSoft Solutions",
        "Zeta Digital", "Veloce Technologies", "Apex Data Labs", "InnoWave Solutions",
        "Crestview AI", "HyperScale Technologies", "BlueSky Digital", "CognitiveWorks"
    ]

    _roles_and_skills = [
        ("Python Developer Intern", ["Python", "Django", "PostgreSQL", "Git", "REST APIs"], "internship", 12000, 20000),
        ("Software Developer Intern", ["Python", "Flask", "SQL", "HTML5", "CSS3", "JavaScript"], "internship", 10000, 18000),
        ("Backend Developer Intern", ["Python", "Flask", "SQL", "REST APIs", "Git"], "internship", 15000, 25000),
        ("Data Analyst Intern", ["SQL", "Power BI", "Python", "Pandas", "NumPy", "EDA"], "internship", 12000, 22000),
        ("Data Analyst Fresher", ["Power BI", "DAX", "SQL", "Python", "Excel", "Pandas"], "fresher", 350000, 550000),
        ("Python Developer Fresher", ["Python", "Django", "SQL", "FastAPI", "Git"], "fresher", 400000, 600000),
        ("AI/ML Intern", ["Python", "NumPy", "Pandas", "AI/ML fundamentals", "Scikit-Learn"], "internship", 15000, 28000),
        ("AI Engineer Intern", ["Python", "AI/ML", "REST APIs", "Flask", "Data Modeling"], "internship", 18000, 30000),
        ("Frontend Developer Intern", ["React", "JavaScript", "HTML5", "CSS3", "Git"], "internship", 10000, 18000),
        ("Full Stack Developer Intern", ["React", "Python", "Flask", "PostgreSQL", "HTML5", "CSS3"], "internship", 15000, 25000),
        ("Web Developer Intern", ["HTML5", "CSS3", "JavaScript", "React", "Git"], "internship", 8000, 15000),
        ("Software Engineer Fresher", ["Python", "SQL", "Data Structures", "Git", "REST APIs"], "fresher", 450000, 650000),
        ("Technical/IT Intern", ["Python", "SQL", "MS Office", "Git", "HTML"], "internship", 8000, 14000),
        ("Mobile App Developer Intern (Flutter)", ["Flutter", "Dart", "Firebase", "REST APIs"], "internship", 12000, 20000),
    ]

    _locations = ["New Delhi", "Remote", "Noida", "Gurgaon", "Bengaluru", "Hyderabad", "Pune", "Mumbai"]
    _sources = ["linkedin", "naukri", "internshala", "company"]

    _recruiters = [
        ("Priya Sharma", "Lead Technical Recruiter", "priya.sharma@technova.com"),
        ("Rahul Verma", "Talent Acquisition Specialist", "rahul.v@cloudsprint.io"),
        ("Ananya Sen", "HR Manager", "ananya.sen@datavue.ai"),
        ("Vikram Malhotra", "University Recruiting Lead", "vikram@webcraftlabs.com"),
        ("Neha Gupta", "HR Specialist - Early Careers", "neha.gupta@codecrafters.in"),
        ("Arjun Patel", "Campus Hiring Manager", "arjun.p@innovatehub.io"),
        ("Sneha Iyer", "People Operations", "sneha.i@pixelworks.tech"),
        ("Rohan Joshi", "Technical Talent Partner", "rohan.j@greenbyte.com"),
        ("Kavita Rao", "Senior Tech Recruiter", "kavita.rao@alphasoft.ai"),
        ("Amitabh Das", "HR Lead", "amitabh.d@brightpath.in"),
    ]

    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Generate 100 mock jobs for comprehensive testing."""
        jobs: List[NormalizedJob] = []

        for i in range(100):
            role_data = self._roles_and_skills[i % len(self._roles_and_skills)]
            role_title, skills, job_type, comp_min, comp_max = role_data
            company = self._companies[i % len(self._companies)]
            location = self._locations[i % len(self._locations)]
            source = self._sources[i % len(self._sources)]
            recruiter_info = self._recruiters[i % len(self._recruiters)]

            days_ago = (i % 12)
            posted_dt = datetime.utcnow() - timedelta(days=days_ago, hours=(i * 3) % 24)
            deadline_dt = (datetime.utcnow() + timedelta(days=20 + (i % 15))).date()

            stipend_min = comp_min if job_type == "internship" else None
            stipend_max = comp_max if job_type == "internship" else None
            salary_min = comp_min if job_type == "fresher" else None
            salary_max = comp_max if job_type == "fresher" else None

            # Add intentional duplicates across platforms for dedup tests
            if i in [15, 16]:
                company = "TechNova Solutions"
                role_title = "Python Developer Intern"
                location = "New Delhi"
                source = "linkedin" if i == 15 else "naukri"

            jobs.append(
                NormalizedJob(
                    job_id=f"demo-{source}-{i+1}",
                    source=source,
                    company=company,
                    role=role_title,
                    location=location,
                    job_type=job_type,
                    experience="0-1 years (Fresher/Student eligible)",
                    salary_min=salary_min,
                    salary_max=salary_max,
                    stipend_min=stipend_min,
                    stipend_max=stipend_max,
                    skills=skills,
                    description=(
                        f"We are hiring a motivated {role_title} at {company} ({location}). "
                        f"Ideal for BCA/B.Tech students and freshers. "
                        f"Required technical skills: {', '.join(skills)}. "
                        "Hands-on academic projects and strong problem-solving capabilities are highly valued."
                    ),
                    application_url=f"https://{source}.com/jobs/view/{i+1000}",
                    posted_date=posted_dt.isoformat(),
                    deadline=deadline_dt.isoformat(),
                    recruiter=recruiter_info[0],
                    recruiter_id=f"rec-{i % len(self._recruiters) + 1}",
                    recruiter_email=recruiter_info[2] if i % 2 == 0 else None,
                    company_url=f"https://{company.lower().replace(' ', '')}.com",
                )
            )

        return jobs

    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        all_jobs = await self.search_jobs()
        for j in all_jobs:
            if j.job_id == job_id:
                return j
        return None


def get_adapters() -> List[BaseJobSourceAdapter]:
    """Return configured adapters."""
    from app.core.config import settings

    if settings.DEMO_MODE:
        return [MockJobSourceAdapter()]
    return [LinkedInAdapter(), NaukriAdapter(), InternshalaAdapter(), CompanyCareerAdapter()]