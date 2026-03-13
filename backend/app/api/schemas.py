"""Pydantic response schemas for the API."""
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PartyOut(BaseModel):
    id: UUID
    name: str
    short_name: Optional[str] = None
    color_hex: Optional[str] = None
    ideology: Optional[str] = None

    class Config:
        from_attributes = True


class PoliticianOut(BaseModel):
    id: UUID
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    province: Optional[str] = None
    photo_url: Optional[str] = None
    consistency_score: Optional[float] = None
    consistency_grade: Optional[str] = None
    activity_score: Optional[float] = None
    external_id: Optional[str] = None

    class Config:
        from_attributes = True


class PoliticianRoleOut(BaseModel):
    id: UUID
    role_title: str
    started_at: date
    ended_at: Optional[date] = None
    district: Optional[str] = None
    party_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class PoliticianDetailOut(PoliticianOut):
    roles: list[PoliticianRoleOut] = []
    party: Optional[PartyOut] = None
    metrics: Optional["LegislatorMetricsOut"] = None


class SessionOut(BaseModel):
    id: UUID
    title: str
    session_type: Optional[str] = None
    date: date
    status: str
    speech_count: int = 0
    external_id: Optional[str] = None

    class Config:
        from_attributes = True


class VoteOut(BaseModel):
    id: UUID
    title: str
    vote_type: Optional[str] = None
    result: Optional[str] = None
    yes_count: int = 0
    no_count: int = 0
    abstain_count: int = 0
    absent_count: int = 0
    voted_at: Optional[datetime] = None
    external_id: Optional[str] = None

    class Config:
        from_attributes = True


class VotePositionOut(BaseModel):
    id: UUID
    vote_id: UUID
    politician_id: UUID
    position: str
    party_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class BillOut(BaseModel):
    id: UUID
    title: str
    number: Optional[str] = None
    summary: Optional[str] = None
    status: str
    introduced_at: Optional[date] = None
    external_id: Optional[str] = None

    class Config:
        from_attributes = True


class CommitteeOut(BaseModel):
    id: UUID
    name: str
    external_id: Optional[str] = None

    class Config:
        from_attributes = True


class CommitteeMembershipOut(BaseModel):
    id: UUID
    committee_id: UUID
    politician_id: UUID
    role: str

    class Config:
        from_attributes = True


class ExecutiveActionOut(BaseModel):
    id: UUID
    action_type: str
    title: str
    number: Optional[str] = None
    date: date
    summary: Optional[str] = None
    source_url: Optional[str] = None

    class Config:
        from_attributes = True


class AssetDeclarationOut(BaseModel):
    id: UUID
    official_name: str
    declaration_year: int
    total_assets: Optional[float] = None
    currency: str = "ARS"
    source_url: Optional[str] = None

    class Config:
        from_attributes = True


class LegislatorMetricsOut(BaseModel):
    legislator_id: str
    attendance_rate: float = 0.0
    vote_participation_rate: float = 0.0
    debate_participation_rate: float = 0.0
    legislative_activity_score: float = 0.0
    bills_authored: int = 0
    bills_coauthored: int = 0
    votes_yes: int = 0
    votes_no: int = 0
    votes_abstain: int = 0
    total_speeches: int = 0
    party_alignment_rate: float = 0.0
    government_alignment_rate: float = 0.0


class ScrapingRunOut(BaseModel):
    id: UUID
    source: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: str
    records_found: int = 0
    records_created: int = 0
    records_updated: int = 0
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    pages: int
