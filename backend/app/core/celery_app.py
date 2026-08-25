"""Celery task queue configuration."""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# Create Celery app
app = Celery(
    settings.APP_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

# Parse automation times
morning_parts = settings.MORNING_RUN_TIME.split(":")
evening_parts = settings.EVENING_RUN_TIME.split(":")

# Celery Beat schedule
app.conf.beat_schedule = {
    "morning-automation": {
        "task": "app.tasks.automation.run_daily_automation",
        "schedule": crontab(hour=int(morning_parts[0]), minute=int(morning_parts[1])),
        "kwargs": {"run_type": "morning"},
    },
    "evening-automation": {
        "task": "app.tasks.automation.run_daily_automation",
        "schedule": crontab(hour=int(evening_parts[0]), minute=int(evening_parts[1])),
        "kwargs": {"run_type": "evening"},
    },
}


# Task auto-discovery
app.autodiscover_tasks(["app.tasks"])


@app.task(bind=True)
def debug_task(self):
    """Debug task for testing."""
    print(f"Request: {self.request!r}")
