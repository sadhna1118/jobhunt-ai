"""SQLAlchemy database models."""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    from sqlalchemy import Text as Vector

Base = declarative_base()


class JobTypeEnum(str, Enum):
    """Job type enumeration."""

    INTERNSHIP = "internship"
    FRESHER = "fresher"
    JUNIOR = "junior"
    FULL_TIME = "full_time"


class JobSourceEnum(str, Enum):
    """Job source enumeration."""

    LINKEDIN = "linkedin"
    NAUKRI = "naukri"
    INTERNSHALA = "internshala"
    COMPANY = "company"
    DEMO = "demo"


class EligibilityStatusEnum(str, Enum):
    """Eligibility status enumeration."""

    ELIGIBLE = "eligible"
    POSSIBLY_ELIGIBLE = "possibly_eligible"
    NOT_ELIGIBLE = "not_eligible"


class ApplicationStatusEnum(str, Enum):
    """Application status enumeration."""

    SAVED = "saved"
    REVIEW = "review"
    READY = "ready"
    APPLIED = "applied"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"
    WITHDRAWN = "withdrawn"


class RecruiterStatusEnum(str, Enum):
    """Recruiter contact status enumeration."""

    NOT_CONTACTED = "not_contacted"
    MESSAGE_READY = "message_ready"
    CONTACTED = "contacted"
    REPLIED = "replied"
    INTERESTED = "interested"
    INTERVIEW = "interview"
    NO_RESPONSE = "no_response"
    DO_NOT_CONTACT = "do_not_contact"


class MessageStatusEnum(str, Enum):
    """Message status enumeration."""

    DRAFT = "draft"
    READY = "ready"
    SENT = "sent"
    FAILED = "failed"
    REPLIED = "replied"


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    recruiters = relationship("Recruiter", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("AutomationSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    connected_accounts = relationship("ConnectedAccount", back_populates="user", cascade="all, delete-orphan")
    approval_items = relationship("ApprovalQueue", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class CandidateProfile(Base):
    """Candidate profile model."""

    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    city = Column(String(100))
    preferred_locations = Column(Text)  # JSON list
    degree = Column(String(150))
    college = Column(String(255))
    graduation_year = Column(Integer)
    skills = Column(Text)  # JSON list
    target_roles = Column(Text)  # JSON list
    projects = Column(Text)  # JSON list of dicts
    certifications = Column(Text)  # JSON list
    experience = Column(Text)  # JSON list
    portfolio_url = Column(String(500))
    github_url = Column(String(500))
    linkedin_url = Column(String(500))
    preferred_salary = Column(Integer)
    preferred_stipend = Column(Integer)
    work_type = Column(String(50), default="remote")  # remote, hybrid, on-site, any
    job_types = Column(Text)  # JSON list: ["internship", "fresher"]
    availability = Column(String(100), default="Immediate")
    about = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")


class Resume(Base):
    """Resume versions model."""

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    version_name = Column(String(100))  # e.g., "Software Developer", "Data Analyst", "AI/ML", "Backend Developer"
    is_default = Column(Boolean, default=False)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    parsed_content = Column(Text)  # JSON extracted content

    # Relationships
    user = relationship("User", back_populates="resumes")


class Job(Base):
    """Job posting model."""

    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("source", "source_job_id", name="uq_source_source_job_id"),)

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), nullable=False)
    source_job_id = Column(String(500), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255))
    job_type = Column(String(50))
    experience_required = Column(String(100))
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    stipend_min = Column(Integer)
    stipend_max = Column(Integer)
    skills_required = Column(Text)  # JSON list
    description = Column(Text)
    application_url = Column(String(500))
    posted_date = Column(DateTime)
    deadline = Column(Date)
    recruiter_name = Column(String(255))
    recruiter_id = Column(String(500))
    recruiter_email = Column(String(255))
    company_url = Column(String(500))
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    approval_items = relationship("ApprovalQueue", back_populates="job", cascade="all, delete-orphan")


class JobMatch(Base):
    """Job matching and eligibility model."""

    __tablename__ = "job_matches"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_match"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    eligibility_status = Column(String(50), nullable=False)  # eligible, possibly_eligible, not_eligible
    eligibility_reason = Column(Text)
    match_score = Column(Float)  # 0-100
    skill_match = Column(Float)
    education_match = Column(Float)
    experience_match = Column(Float)
    role_match = Column(Float)
    location_match = Column(Float)
    salary_match = Column(Float)
    freshness = Column(Float)
    match_details = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="matches")


class Application(Base):
    """Job application tracking model."""

    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_application"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String(50), default="saved")  # saved, review, ready, applied, interview, rejected, offer
    match_score = Column(Float)
    resume_used = Column(String(100))
    cover_letter = Column(Text)
    applied_date = Column(DateTime)
    application_url = Column(String(500))
    response_date = Column(DateTime)
    response_text = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class Recruiter(Base):
    """Recruiter/HR contact tracking model (Recruiter CRM)."""

    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    company = Column(String(255))
    role = Column(String(255))
    platform = Column(String(100))  # linkedin, naukri, internshala, email
    profile_url = Column(String(500))
    platform_id = Column(String(500))
    status = Column(String(50), default="not_contacted")  # not_contacted, message_ready, contacted, replied, interested, interview, no_response, do_not_contact
    first_contact_date = Column(DateTime)
    last_contact_date = Column(DateTime)
    total_contacts = Column(Integer, default=0)
    response_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recruiters")
    messages = relationship("Message", back_populates="recruiter", cascade="all, delete-orphan")
    approval_items = relationship("ApprovalQueue", back_populates="recruiter", cascade="all, delete-orphan")


class Message(Base):
    """Outreach message tracking model."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_type = Column(String(50), default="linkedin")  # linkedin, email, telegram
    status = Column(String(50), default="draft")  # draft, ready, sent, failed, replied
    subject = Column(String(255))
    content = Column(Text, nullable=False)
    sent_date = Column(DateTime)
    response_date = Column(DateTime)
    response_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recruiter = relationship("Recruiter", back_populates="messages")


class AutomationRun(Base):
    """Automation execution log model."""

    __tablename__ = "automation_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    run_time = Column(String(10))  # "05:00" or "21:00" or "manual"
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_time = Column(DateTime)
    status = Column(String(50), default="success")  # success, failed, partial
    jobs_discovered = Column(Integer, default=0)
    jobs_eligible = Column(Integer, default=0)
    jobs_high_match = Column(Integer, default=0)
    applications_submitted = Column(Integer, default=0)
    applications_skipped = Column(Integer, default=0)
    hr_messages_sent = Column(Integer, default=0)
    hr_messages_skipped = Column(Integer, default=0)
    errors = Column(Text)
    report = Column(Text)  # JSON report
    created_at = Column(DateTime, default=datetime.utcnow)


class AutomationSettings(Base):
    """User automation configuration model."""

    __tablename__ = "automation_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_enabled = Column(Boolean, default=True)
    morning_time = Column(String(10), default="05:00")
    evening_time = Column(String(10), default="21:00")
    daily_application_limit = Column(Integer, default=10)
    daily_email_limit = Column(Integer, default=5)
    min_match_score = Column(Float, default=75.0)
    enabled_sources = Column(Text)  # JSON list: ["linkedin", "naukri", "internshala", "company"]
    target_job_types = Column(Text)  # JSON list: ["internship", "fresher"]
    target_locations = Column(Text)  # JSON list
    auto_apply_enabled = Column(Boolean, default=False)
    auto_message_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="settings")


class ApprovalQueue(Base):
    """Approval queue for Human-in-the-Loop actions."""

    __tablename__ = "approval_queue"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(50))  # "application", "hr_message", "email", "question"
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    data = Column(Text)  # JSON payload (cover letter, message text, email body, etc.)
    status = Column(String(50), default="pending")  # pending, approved, rejected, skipped
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="approval_items")
    job = relationship("Job", back_populates="approval_items")
    recruiter = relationship("Recruiter", back_populates="approval_items")


class ConnectedAccount(Base):
    """Connected account (LinkedIn, Naukri, Internshala, Gmail)."""

    __tablename__ = "connected_accounts"
    __table_args__ = (UniqueConstraint("user_id", "platform", name="uq_user_platform"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # linkedin, naukri, internshala, gmail
    is_connected = Column(Boolean, default=False)
    account_email = Column(String(255))
    connected_at = Column(DateTime)
    token_data = Column(Text)  # Encrypted OAuth or session info
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="connected_accounts")


class Notification(Base):
    """System notification model."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text)
    notification_type = Column(String(50), default="info")  # info, success, warning, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    """Security and compliance audit log."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    old_values = Column(Text)  # JSON
    new_values = Column(Text)  # JSON
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
