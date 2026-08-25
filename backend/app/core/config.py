"""Core configuration module."""
import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Application
    APP_NAME: str = "JOBHUNT AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    TIMEZONE: str = "Asia/Kolkata"

    # Database (Default to async sqlite for zero-friction local run; seamless postgres in docker/prod)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./jobhunt.db")
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None

    # URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"]

    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # OAuth
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    GMAIL_CLIENT_ID: Optional[str] = None
    GMAIL_CLIENT_SECRET: Optional[str] = None
    NAUKRI_API_KEY: Optional[str] = None
    INTERNSHALA_API_KEY: Optional[str] = None

    # Automation
    AUTOMATION_ENABLED: bool = True
    MORNING_RUN_TIME: str = "05:00"
    EVENING_RUN_TIME: str = "21:00"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Limits
    DAILY_APPLICATION_LIMIT: int = 10
    DAILY_EMAIL_LIMIT: int = 5
    MIN_MATCH_SCORE: float = 75.0
    RECRUITER_RECONTACT_DAYS: int = 30

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@jobhunt-ai.com"
    EMAIL_FROM_NAME: str = "JOBHUNT AI"

    # Telegram
    TELEGRAM_ENABLED: bool = False
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None

    # Playwright
    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_TIMEOUT: int = 30000
    PLAYWRIGHT_SLOW_MO: int = 0

    # Demo Mode
    DEMO_MODE: bool = True
    DEMO_JOB_COUNT: int = 100
    DEMO_RECRUITER_COUNT: int = 50

    # Security
    JWT_SECRET: str = "jobhunt-ai-super-secret-production-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 7
    CSRF_ENABLED: bool = True

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 5
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_RESUME_EXTENSIONS: List[str] = ["pdf", "docx", "doc"]

    # Audit
    AUDIT_LOGGING_ENABLED: bool = True
    AUDIT_LOG_RETENTION_DAYS: int = 90
    SENTRY_DSN: Optional[str] = None

    # Testing
    TESTING: bool = False
    SEED_DATABASE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

    def get_database_url(self) -> str:
        """Get the database URL formatted for async SQLAlchemy."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://")
        if url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
            return url.replace("sqlite://", "sqlite+aiosqlite://")
        return url


settings = Settings()
