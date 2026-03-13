"""API routes for bills/legislative projects."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Bill, BillAuthor, BillStage
from app.api.schemas import BillOut

router = APIRouter(prefix="/bills", tags=["bills"])


@router.get("", response_model=list[BillOut])
async def list_bills(
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(Bill).order_by(Bill.introduced_at.desc().nullslast())

    if status:
        query = query.where(Bill.status == status)
    if year:
        query = query.where(func.extract("year", Bill.introduced_at) == year)
    if search:
        query = query.where(Bill.title.ilike(f"%{search}%"))

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{bill_id}", response_model=BillOut)
async def get_bill(bill_id: UUID, db: AsyncSession = Depends(get_db)):
    bill = await db.get(Bill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.get("/{bill_id}/authors")
async def get_bill_authors(bill_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BillAuthor).where(BillAuthor.bill_id == bill_id)
    )
    return result.scalars().all()
