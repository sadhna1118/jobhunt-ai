"""Pydantic schemas for request/response validation."""
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = "Sadhna"


# ---------- User & Profile ----------
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    degree: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferred_salary: Optional[int] = None
    preferred_stipend: Optional[int] = None
    work_type: Optional[str] = None
    job_types: Optional[List[str]] = None
    availability: Optional[str] = None
    about: Optional[str] = None

    class Config:
        from_attributes = True


class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    degree: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferred_salary: Optional[int] = None
    preferred_stipend: Optional[int] = None
    work_type: Optional[str] = None
    job_types: Optional[List[str]] = None
    availability: Optional[str] = None
    about: Optional[str] = None


# ---------- Resume ----------
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_path: str
    version_name: Optional[str] = None
    is_default: bool = False
    file_size: Optional[int] = None
    uploaded_at: datetime
    parsed_content: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ---------- Jobs ----------
class JobResponse(BaseModel):
    id: int
    source: str
    source_job_id: str
    company: str
    role: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_required: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    skills_required: Optional[List[str]] = None
    description: Optional[str] = None
    application_url: Optional[str] = None
    posted_date: Optional[datetime] = None
    deadline: Optional[date] = None
    recruiter_name: Optional[str] = None
    recruiter_id: Optional[str] = None
    recruiter_email: Optional[str] = None
    company_url: Optional[str] = None
    is_available: bool = True
    match_score: Optional[float] = None
    eligibility_status: Optional[str] = None
    eligibility_reason: Optional[str] = None

    class Config:
        from_attributes = True


class JobMatchResponse(BaseModel):
    id: int
    job: JobResponse
    eligibility_status: str
    eligibility_reason: Optional[str] = None
    match_score: float
    skill_match: Optional[float] = None
    education_match: Optional[float] = None
    experience_match: Optional[float] = None
    role_match: Optional[float] = None
    location_match: Optional[float] = None
    salary_match: Optional[float] = None
    freshness: Optional[float] = None
    match_details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ---------- Applications ----------
class ApplicationCreate(BaseModel):
    job_id: int
    resume_used: Optional[str] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "applied"


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    response_text: Optional[str] = None
    response_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    match_score: Optional[float] = None
    resume_used: Optional[str] = None
    cover_letter: Optional[str] = None
    applied_date: Optional[datetime] = None
    application_url: Optional[str] = None
    response_date: Optional[datetime] = None
    response_text: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True


# ---------- Recruiters ----------
class RecruiterResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    platform: Optional[str] = None
    profile_url: Optional[str] = None
    platform_id: Optional[str] = None
    status: str
    first_contact_date: Optional[datetime] = None
    last_contact_date: Optional[datetime] = None
    total_contacts: int = 0
    response_date: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class RecruiterUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    platform: Optional[str] = None
    profile_url: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


# ---------- Messages & Emails ----------
class MessageResponse(BaseModel):
    id: int
    recruiter_id: int
    message_type: str
    status: str
    subject: Optional[str] = None
    content: str
    sent_date: Optional[datetime] = None
    response_date: Optional[datetime] = None
    response_text: Optional[str] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    recruiter_id: int
    message_type: str = "linkedin"
    subject: Optional[str] = None
    content: str


# ---------- Automation ----------
class AutomationRunResponse(BaseModel):
    id: int
    run_time: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    jobs_discovered: int = 0
    jobs_eligible: int = 0
    jobs_high_match: int = 0
    applications_submitted: int = 0
    applications_skipped: int = 0
    hr_messages_sent: int = 0
    hr_messages_skipped: int = 0
    errors: Optional[str] = None
    report: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class AutomationSettingsUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    morning_time: Optional[str] = None
    evening_time: Optional[str] = None
    daily_application_limit: Optional[int] = None
    daily_email_limit: Optional[int] = None
    min_match_score: Optional[float] = None
    enabled_sources: Optional[List[str]] = None
    target_job_types: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None
    auto_apply_enabled: Optional[bool] = None
    auto_message_enabled: Optional[bool] = None


class AutomationSettingsResponse(BaseModel):
    id: int
    is_enabled: bool
    morning_time: str
    evening_time: str
    daily_application_limit: int
    daily_email_limit: int
    min_match_score: float
    enabled_sources: Optional[List[str]] = None
    target_job_types: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None
    auto_apply_enabled: bool
    auto_message_enabled: bool

    class Config:
        from_attributes = True


# ---------- Approval Queue ----------
class ApprovalItemResponse(BaseModel):
    id: int
    action_type: str
    job_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    data: Optional[Dict[str, Any]] = None
    status: str
    priority: int
    created_at: datetime
    job: Optional[JobResponse] = None
    recruiter: Optional[RecruiterResponse] = None

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    decision: str  # approve, reject, skip, edit
    data_override: Optional[Dict[str, Any]] = None


# ---------- Connected Accounts ----------
class ConnectedAccountResponse(BaseModel):
    id: Optional[int] = None
    platform: str
    is_connected: bool
    account_email: Optional[str] = None
    connected_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConnectAccountRequest(BaseModel):
    platform: str
    account_email: Optional[str] = None
    auth_code: Optional[str] = None


# ---------- Notifications ----------
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: Optional[str] = None
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Dashboard & Analytics ----------
class DashboardStats(BaseModel):
    jobs_found_today: int = 0
    eligible_jobs: int = 0
    high_match_jobs: int = 0
    applications_submitted: int = 0
    applications_pending: int = 0
    hr_messages_sent: int = 0
    hr_messages_skipped: int = 0
    hr_replies: int = 0
    interviews: int = 0
    rejected: int = 0
    offers: int = 0


class AnalyticsResponse(BaseModel):
    applications_by_source: Dict[str, int]
    response_rate: float
    interview_rate: float
    match_score_distribution: Dict[str, int]
    weekly_applications: List[Dict[str, Any]]


# ---------- AI Assistant ----------
class AssistantQuery(BaseModel):
    query: str


class AssistantResponse(BaseModel):
    answer: str
    data: Optional[List[Dict[str, Any]]] = None
    query_type: Optional[str] = None


# ---------- Daily Report ----------
class DailyReport(BaseModel):
    run_time: str
    jobs_discovered: int
    eligible: int
    high_match: int
    applications_submitted: int
    applications_skipped: int
    hr_messages_sent: int
    hr_messages_skipped: int
    reasons_for_skipped_hrs: Optional[List[str]] = None
    top_opportunities: List[Dict[str, Any]]
    potential_interviews: int
    actions_requiring_approval: int


# ---------- Cover Letter ----------
class CoverLetterRequest(BaseModel):
    job_id: int
    extra_notes: Optional[str] = None


class CoverLetterResponse(BaseModel):
    cover_letter: str
    job: JobResponse