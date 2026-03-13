"""API routes for asset declarations."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import AssetDeclaration, AssetItem
from app.api.schemas import AssetDeclarationOut

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/declarations", response_model=list[AssetDeclarationOut])
async def list_declarations(
    year: Optional[int] = Query(None),
    politician_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(AssetDeclaration).order_by(AssetDeclaration.declaration_year.desc())

    if year:
        query = query.where(AssetDeclaration.declaration_year == year)
    if politician_id:
        query = query.where(AssetDeclaration.politician_id == politician_id)

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/declarations/{declaration_id}")
async def get_declaration_detail(
    declaration_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    decl = await db.get(AssetDeclaration, declaration_id)
    if not decl:
        raise HTTPException(status_code=404, detail="Declaration not found")

    items_result = await db.execute(
        select(AssetItem).where(AssetItem.declaration_id == declaration_id)
    )
    items = items_result.scalars().all()

    return {
        "declaration": decl,
        "items": items,
    }


@router.get("/growth/{politician_id}")
async def get_asset_growth(
    politician_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AssetDeclaration)
        .where(AssetDeclaration.politician_id == politician_id)
        .order_by(AssetDeclaration.declaration_year)
    )
    declarations = result.scalars().all()

    if len(declarations) < 2:
        return {"growth_rate": None, "declarations": declarations}

    first = declarations[0]
    last = declarations[-1]

    growth_rate = None
    if first.total_assets and last.total_assets and first.total_assets > 0:
        growth_rate = ((last.total_assets - first.total_assets) / first.total_assets) * 100

    return {
        "growth_rate": growth_rate,
        "period": f"{first.declaration_year}-{last.declaration_year}",
        "declarations": declarations,
    }
