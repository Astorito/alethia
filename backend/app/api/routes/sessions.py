"""API routes for sessions and speeches."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Session, Speech, SessionAttendance
from app.api.schemas import SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
async def list_sessions(
    year: Optional[int] = Query(None),
    session_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(Session).order_by(Session.date.desc())

    if year:
        query = query.where(func.extract("year", Session.date) == year)
    if session_type:
        query = query.where(Session.session_type == session_type)

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{session_id}", response_model=SessionOut)
async def get_session(session_id: UUID, db: AsyncSession = Depends(get_db)):
    session = await db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/speeches")
async def get_session_speeches(session_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Speech)
        .where(Speech.session_id == session_id)
        .order_by(Speech.sequence_order)
    )
    return result.scalars().all()


@router.get("/{session_id}/attendance")
async def get_session_attendance(session_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SessionAttendance).where(SessionAttendance.session_id == session_id)
    )
    return result.scalars().all()
