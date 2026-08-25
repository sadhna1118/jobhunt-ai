"""FastAPI application factory."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    logger.info(f"Starting {settings.APP_NAME} application")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Initialize database tables
    try:
        await init_db()
        logger.info("Database initialized successfully.")

        if settings.SEED_DATABASE:
            from app.api.deps import get_or_create_demo_user
            from app.tasks.automation import execute_automation_workflow
            async with AsyncSessionLocal() as db:
                user = await get_or_create_demo_user(db)
                await execute_automation_workflow(user.id, run_time="startup_seed")
            logger.info("Demo user profile and initial job discovery seeded.")
    except Exception as e:
        logger.error(f"Startup initialization notice: {e}")

    yield

    logger.info(f"Shutting down {settings.APP_NAME} application")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="JOBHUNT AI - Personal AI Career Automation Platform for Sadhna",
        version="1.0.0",
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import routes after app creation
    from app.api import applications, automation, health, jobs, recruiters, users, auth

    # Include routers
    app.include_router(health.router, prefix="/api/health", tags=["health"])
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
    app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
    app.include_router(recruiters.router, prefix="/api/recruiters", tags=["recruiters"])
    app.include_router(automation.router, prefix="/api/automation", tags=["automation"])

    return app


app = create_app()
