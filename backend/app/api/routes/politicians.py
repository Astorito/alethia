"""API routes for politicians/legislators."""
from math import ceil
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models import (
    Politician, PoliticianRole, Party, VotePosition, Vote,
    Speech, Bill, BillAuthor, CommitteeMembership, Committee,
)
from app.api.schemas import (
    PoliticianOut, PoliticianDetailOut, PoliticianRoleOut,
    CommitteeOut, CommitteeMembershipOut, LegislatorMetricsOut,
)
from app.etl.metrics import calculate_legislator_metrics

router = APIRouter(prefix="/politicians", tags=["politicians"])


@router.get("", response_model=list[PoliticianOut])
async def list_politicians(
    chamber: Optional[str] = Query(None, description="Filter by chamber: deputies/senate"),
    province: Optional[str] = Query(None),
    party: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(Politician)

    if search:
        query = query.where(Politician.full_name.ilike(f"%{search}%"))
    if province:
        query = query.where(Politician.province == province)

    if chamber:
        chamber_type = "deputies" if chamber == "deputies" else "senate"
        query = query.join(PoliticianRole).where(
            PoliticianRole.ended_at.is_(None),
        ).join(
            PoliticianRole.institution_id.__class__
        )

    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{politician_id}", response_model=PoliticianDetailOut)
async def get_politician(
    politician_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Politician)
        .options(selectinload(Politician.roles))
        .where(Politician.id == politician_id)
    )
    pol = result.scalar_one_or_none()
    if not pol:
        raise HTTPException(status_code=404, detail="Politician not found")

    party = None
    current_role = next((r for r in pol.roles if r.ended_at is None), None)
    if current_role and current_role.party_id:
        party_result = await db.execute(select(Party).where(Party.id == current_role.party_id))
        party = party_result.scalar_one_or_none()

    return PoliticianDetailOut(
        **{k: v for k, v in pol.__dict__.items() if not k.startswith("_")},
        roles=[PoliticianRoleOut.model_validate(r) for r in pol.roles],
        party=party,
    )


@router.get("/{politician_id}/metrics", response_model=LegislatorMetricsOut)
async def get_politician_metrics(
    politician_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    pol = await db.get(Politician, politician_id)
    if not pol:
        raise HTTPException(status_code=404, detail="Politician not found")

    # Fetch votes
    vp_result = await db.execute(
        select(VotePosition, Vote)
        .join(Vote, VotePosition.vote_id == Vote.id)
        .where(VotePosition.politician_id == politician_id)
        .order_by(Vote.voted_at)
    )
    votes = [
        {
            "vote_id": str(vp.vote_id),
            "vote_value": vp.position,
            "session_id": str(v.session_id),
            "vote_date": v.voted_at,
        }
        for vp, v in vp_result.all()
    ]

    # Fetch speeches
    speech_result = await db.execute(
        select(Speech).where(Speech.politician_id == politician_id)
    )
    speeches = [
        {"session_id": str(s.session_id), "word_count": s.word_count or 0}
        for s in speech_result.scalars().all()
    ]

    # Bills authored
    bills_authored = await db.scalar(
        select(func.count())
        .select_from(BillAuthor)
        .where(BillAuthor.politician_id == politician_id, BillAuthor.role == "author")
    )
    bills_coauthored = await db.scalar(
        select(func.count())
        .select_from(BillAuthor)
        .where(BillAuthor.politician_id == politician_id, BillAuthor.role == "co_author")
    )

    metrics = calculate_legislator_metrics(
        legislator_id=str(politician_id),
        votes=votes,
        sessions=[],
        speeches=speeches,
        bills_authored=bills_authored or 0,
        bills_coauthored=bills_coauthored or 0,
    )

    return LegislatorMetricsOut(
        legislator_id=metrics.legislator_id,
        attendance_rate=metrics.attendance_rate,
        vote_participation_rate=metrics.vote_participation_rate,
        debate_participation_rate=metrics.debate_participation_rate,
        legislative_activity_score=metrics.legislative_activity_score,
        bills_authored=metrics.bills_authored,
        bills_coauthored=metrics.bills_coauthored,
        votes_yes=metrics.votes_yes,
        votes_no=metrics.votes_no,
        votes_abstain=metrics.votes_abstain,
        total_speeches=metrics.total_speeches,
        party_alignment_rate=metrics.party_alignment_rate,
        government_alignment_rate=metrics.government_alignment_rate,
    )


@router.get("/{politician_id}/committees", response_model=list[CommitteeOut])
async def get_politician_committees(
    politician_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Committee)
        .join(CommitteeMembership)
        .where(CommitteeMembership.politician_id == politician_id)
    )
    return result.scalars().all()
