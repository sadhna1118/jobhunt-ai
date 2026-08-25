"""Base job source adapter interface."""
from abc import ABC, abstractmethod
from typing import List, Optional

from pydantic import BaseModel


class NormalizedJob(BaseModel):
    """Standard normalized job representation across all sources."""

    job_id: str
    source: str
    company: str
    role: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    skills: Optional[List[str]] = None
    description: Optional[str] = None
    application_url: Optional[str] = None
    posted_date: Optional[str] = None
    deadline: Optional[str] = None
    recruiter: Optional[str] = None
    recruiter_id: Optional[str] = None
    recruiter_email: Optional[str] = None
    company_url: Optional[str] = None


class BaseJobSourceAdapter(ABC):
    """Base class for all job source adapters."""

    source_name: str = "base"

    @abstractmethod
    async def search_jobs(self, query: Optional[str] = None, **kwargs) -> List[NormalizedJob]:
        """Search for jobs from this source."""
        raise NotImplementedError

    @abstractmethod
    async def fetch_job_details(self, job_id: str) -> Optional[NormalizedJob]:
        """Fetch details for a specific job."""
        raise NotImplementedError