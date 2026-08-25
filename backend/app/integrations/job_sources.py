"""Job source adapters for discovering jobs from different platforms."""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class NormalizedJob:
    """Normalized job representation."""

    job_id: str
    source: str
    company: str
    role: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_required: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    skills_required: Optional[list[str]] = None
    description: Optional[str] = None
    application_url: Optional[str] = None
    posted_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_id: Optional[str] = None
    company_url: Optional[str] = None


class JobSource(ABC):
    """Abstract base class for job sources."""

    @abstractmethod
    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Search for jobs on the platform."""
        pass

    @abstractmethod
    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get detailed information about a specific job."""
        pass


class LinkedInAdapter(JobSource):
    """LinkedIn job source adapter."""

    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Search LinkedIn for jobs."""
        # TODO: Implement LinkedIn search using Playwright
        return []

    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get LinkedIn job details."""
        # TODO: Implement LinkedIn job details fetching
        return None


class NaukriAdapter(JobSource):
    """Naukri job source adapter."""

    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Search Naukri for jobs."""
        # TODO: Implement Naukri search
        return []

    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get Naukri job details."""
        # TODO: Implement Naukri job details fetching
        return None


class InternshalaAdapter(JobSource):
    """Internshala job source adapter."""

    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Search Internshala for jobs."""
        # TODO: Implement Internshala search
        return []

    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get Internshala job details."""
        # TODO: Implement Internshala job details fetching
        return None


class CompanyCareerAdapter(JobSource):
    """Company career pages adapter."""

    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Search company career pages."""
        # TODO: Implement company career page search
        return []

    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get company career page job details."""
        # TODO: Implement company career page details fetching
        return None


class DemoJobAdapter(JobSource):
    """Demo job source for testing."""

    DEMO_JOBS = [
        NormalizedJob(
            job_id="demo_1",
            source="demo",
            company="TechCorp India",
            role="Python Developer Intern",
            location="New Delhi",
            job_type="internship",
            skills_required=["Python", "Django", "PostgreSQL"],
            description="Building backend services for our platform",
            salary_min=0,
            salary_max=0,
            stipend_min=5000,
            stipend_max=15000,
            application_url="https://example.com/apply/1",
        ),
        NormalizedJob(
            job_id="demo_2",
            source="demo",
            company="DataSoft Solutions",
            role="Data Analyst Intern",
            location="Bangalore",
            job_type="internship",
            skills_required=["Power BI", "SQL", "Python"],
            description="Analyzing business data and creating insights",
            salary_min=0,
            salary_max=0,
            stipend_min=8000,
            stipend_max=12000,
            application_url="https://example.com/apply/2",
        ),
        NormalizedJob(
            job_id="demo_3",
            source="demo",
            company="FullStack Innovations",
            role="Full Stack Developer Fresher",
            location="Mumbai",
            job_type="fresher",
            skills_required=["React", "Node.js", "MongoDB"],
            description="Building web applications for enterprise clients",
            salary_min=300000,
            salary_max=500000,
            application_url="https://example.com/apply/3",
        ),
    ]

    async def search(
        self,
        keywords: list[str],
        locations: list[str],
        job_types: list[str],
        **kwargs,
    ) -> list[NormalizedJob]:
        """Return demo jobs for testing."""
        return self.DEMO_JOBS

    async def get_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Get demo job details."""
        for job in self.DEMO_JOBS:
            if job.job_id == job_id:
                return job
        return None
