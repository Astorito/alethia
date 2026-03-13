"""API routes for executive branch data."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import ExecutiveOfficial, ExecutiveAction
from app.api.schemas import ExecutiveActionOut

router = APIRouter(prefix="/executive", tags=["executive"])


@router.get("/officials")
async def list_officials(
    current_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    query = select(ExecutiveOfficial)
    if current_only:
        query = query.where(ExecutiveOfficial.ended_at.is_(None))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/actions", response_model=list[ExecutiveActionOut])
async def list_actions(
    action_type: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(ExecutiveAction).order_by(ExecutiveAction.date.desc())

    if action_type:
        query = query.where(ExecutiveAction.action_type == action_type)
    if year:
        query = query.where(func.extract("year", ExecutiveAction.date) == year)

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()
