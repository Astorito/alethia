"""
Celery application for background task processing.

Tasks:
  - Scheduled pipeline runs (daily scraping)
  - Metrics recalculation
  - Transcript processing
"""
from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "alethia",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Argentina/Buenos_Aires",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "daily-deputies-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=7, minute=0),
        "args": ("deputies",),
    },
    "daily-senators-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=7, minute=15),
        "args": ("senators",),
    },
    "daily-votes-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=7, minute=30),
        "args": ("deputies_votes",),
    },
    "daily-senate-votes-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=8, minute=0),
        "args": ("senate_votes",),
    },
    "daily-bills-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=8, minute=30),
        "args": ("bills",),
    },
    "weekly-executive-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
        "args": ("executive",),
    },
    "weekly-assets-scrape": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=9, minute=30, day_of_week=1),
        "args": ("assets",),
    },
    "weekly-photos-sync": {
        "task": "app.workers.tasks.run_pipeline_step",
        "schedule": crontab(hour=10, minute=0, day_of_week=1),
        "args": ("photos",),
    },
    "daily-metrics-recalculation": {
        "task": "app.workers.tasks.recalculate_all_metrics",
        "schedule": crontab(hour=11, minute=0),
    },
}
