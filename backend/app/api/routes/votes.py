"""API routes for votes and voting records."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Vote, VotePosition, Session
from app.api.schemas import VoteOut, VotePositionOut

router = APIRouter(prefix="/votes", tags=["votes"])


@router.get("", response_model=list[VoteOut])
async def list_votes(
    chamber: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    result: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(Vote).order_by(Vote.voted_at.desc())

    if year:
        query = query.where(func.extract("year", Vote.voted_at) == year)
    if result:
        query = query.where(Vote.result.ilike(f"%{result}%"))

    query = query.offset((page - 1) * page_size).limit(page_size)
    res = await db.execute(query)
    return res.scalars().all()


@router.get("/{vote_id}", response_model=VoteOut)
async def get_vote(vote_id: UUID, db: AsyncSession = Depends(get_db)):
    vote = await db.get(Vote, vote_id)
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    return vote


@router.get("/{vote_id}/positions", response_model=list[VotePositionOut])
async def get_vote_positions(vote_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VotePosition).where(VotePosition.vote_id == vote_id)
    )
    return result.scalars().all()
