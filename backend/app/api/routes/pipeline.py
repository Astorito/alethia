"""API routes for pipeline management and monitoring."""
import asyncio
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.db import get_db
from app.models import ScrapingRun
from app.api.schemas import ScrapingRunOut
from app.etl.pipeline import AlethiaPipeline
from app.config import get_settings

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


async def _run_pipeline_background(steps: Optional[list[str]] = None):
    """
    Funcion interna que corre el pipeline en background con su propia sesion de DB.
    Esto evita que la sesion de FastAPI se cierre antes de que termine el trabajo.
    """
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        pipeline = AlethiaPipeline(db)
        
        if not steps:
            await pipeline.run_full_pipeline()
        else:
            step_map = {
                "deputies": pipeline.ingest_deputies,
                "senators": pipeline.ingest_senators,
                "deputies_votes": lambda: pipeline.ingest_votes("deputies"),
                "senate_votes": lambda: pipeline.ingest_votes("senate"),
                "bills": pipeline.ingest_bills,
                "executive": pipeline.ingest_executive,
                "assets": pipeline.ingest_asset_declarations,
                # "photos": pipeline.ingest_photos,  # Requiere MinIO - deshabilitado sin Docker
            }
            
            for step_name in steps:
                fn = step_map.get(step_name)
                if fn:
                    await fn()
    
    await engine.dispose()


@router.post("/run")
async def trigger_pipeline(
    steps: Optional[list[str]] = Query(None, description="Steps to run: deputies, senators, votes, bills, executive, assets, photos"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Trigger pipeline execution. Runs in background.
    
    El pipeline se ejecuta con su propia conexion a la DB, independiente de la request HTTP.
    """
    background_tasks.add_task(_run_pipeline_background, steps)
    
    if not steps:
        return {"status": "started", "message": "Full pipeline triggered"}
    else:
        return {"status": "started", "steps": steps}


@router.get("/runs", response_model=list[ScrapingRunOut])
async def list_pipeline_runs(
    source: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(ScrapingRun).order_by(ScrapingRun.started_at.desc()).limit(limit)
    if source:
        query = query.where(ScrapingRun.source == source)
    result = await db.execute(query)
    return result.scalars().all()
