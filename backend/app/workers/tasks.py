"""
Celery tasks for background processing.
"""
import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session as DBSession

from app.workers.celery_app import celery_app
from app.config import get_settings
from app.models import Politician, VotePosition, Vote, Speech, BillAuthor
from app.etl.metrics import calculate_legislator_metrics

import structlog

logger = structlog.get_logger()
settings = get_settings()


def _run_async(coro):
    """Helper to run async code from sync Celery tasks."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.workers.tasks.run_pipeline_step")
def run_pipeline_step(step: str):
    """Run a specific pipeline step."""
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from app.etl.pipeline import AlethiaPipeline

    async def _run():
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async with async_session() as db:
            pipeline = AlethiaPipeline(db)
            step_map = {
                "deputies": pipeline.ingest_deputies,
                "senators": pipeline.ingest_senators,
                "deputies_votes": lambda: pipeline.ingest_votes("deputies"),
                "senate_votes": lambda: pipeline.ingest_votes("senate"),
                "bills": pipeline.ingest_bills,
                "executive": pipeline.ingest_executive,
                "assets": pipeline.ingest_asset_declarations,
                "photos": pipeline.ingest_photos,
            }

            fn = step_map.get(step)
            if fn:
                await fn()
                logger.info(f"pipeline step completed: {step}")
            else:
                logger.error(f"unknown pipeline step: {step}")

        await engine.dispose()

    _run_async(_run())
    return {"step": step, "status": "completed"}


@celery_app.task(name="app.workers.tasks.recalculate_all_metrics")
def recalculate_all_metrics():
    """Recalculate metrics for all politicians."""
    from sqlalchemy import func

    engine = create_engine(settings.DATABASE_URL_SYNC)

    with DBSession(engine) as db:
        politicians = db.execute(select(Politician)).scalars().all()
        updated = 0

        for pol in politicians:
            vp_rows = db.execute(
                select(VotePosition, Vote)
                .join(Vote, VotePosition.vote_id == Vote.id)
                .where(VotePosition.politician_id == pol.id)
                .order_by(Vote.voted_at)
            ).all()

            votes = [
                {
                    "vote_id": str(vp.vote_id),
                    "vote_value": vp.position,
                    "session_id": str(v.session_id),
                }
                for vp, v in vp_rows
            ]

            speeches = db.execute(
                select(Speech).where(Speech.politician_id == pol.id)
            ).scalars().all()
            speech_data = [
                {"session_id": str(s.session_id), "word_count": s.word_count or 0}
                for s in speeches
            ]

            bills_authored = db.scalar(
                select(func.count())
                .select_from(BillAuthor)
                .where(BillAuthor.politician_id == pol.id, BillAuthor.role == "author")
            ) or 0

            metrics = calculate_legislator_metrics(
                legislator_id=str(pol.id),
                votes=votes,
                sessions=[],
                speeches=speech_data,
                bills_authored=bills_authored,
            )

            pol.activity_score = metrics.legislative_activity_score
            updated += 1

        db.commit()
        logger.info(f"metrics recalculated for {updated} politicians")

    engine.dispose()
    return {"updated": updated}
