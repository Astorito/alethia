import uuid
from datetime import date, datetime
from typing import Optional
from sqlalchemy import (
    String, Text, Integer, Float, Boolean, Date, DateTime,
    ForeignKey, UniqueConstraint, CheckConstraint, Numeric, Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

# Enums de PostgreSQL — create_type=False porque ya existen en Supabase
ChamberTypeEnum = SAEnum(
    "deputies", "senate", "executive", "municipal",
    name="chamber_type", create_type=False,
)
SessionStatusEnum = SAEnum(
    "scheduled", "in_progress", "completed", "cancelled",
    name="session_status", create_type=False,
)
VotePositionEnum = SAEnum(
    "yes", "no", "abstain", "absent", "present",
    name="vote_position", create_type=False,
)
BillStatusEnum = SAEnum(
    "draft", "committee", "floor", "passed", "rejected", "vetoed", "enacted",
    name="bill_status", create_type=False,
)
SourceTypeEnum = SAEnum(
    "transcript", "video", "xml_api", "pdf", "manual",
    name="source_type", create_type=False,
)
StanceTypeEnum = SAEnum(
    "support", "oppose", "neutral", "mixed",
    name="stance_type", create_type=False,
)
SentimentTypeEnum = SAEnum(
    "positive", "negative", "neutral",
    name="sentiment_type", create_type=False,
)


def new_uuid():
    return uuid.uuid4()


class Institution(Base):
    __tablename__ = "institutions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[str] = mapped_column(ChamberTypeEnum, nullable=False)
    country: Mapped[str] = mapped_column(Text, default="AR")
    province: Mapped[Optional[str]] = mapped_column(Text)
    api_base_url: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Party(Base):
    __tablename__ = "parties"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(Text)
    color_hex: Mapped[Optional[str]] = mapped_column(Text)
    ideology: Mapped[Optional[str]] = mapped_column(Text)
    founded_at: Mapped[Optional[date]] = mapped_column(Date)
    dissolved_at: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Politician(Base):
    __tablename__ = "politicians"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(Text)
    last_name: Mapped[Optional[str]] = mapped_column(Text)
    gender: Mapped[Optional[str]] = mapped_column(Text)
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    province: Mapped[Optional[str]] = mapped_column(Text)
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    consistency_score: Mapped[Optional[float]] = mapped_column(Float)
    consistency_grade: Mapped[Optional[str]] = mapped_column(Text)
    activity_score: Mapped[Optional[float]] = mapped_column(Float)
    last_analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[Optional[str]] = mapped_column(SourceTypeEnum, default="manual")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    roles: Mapped[list["PoliticianRole"]] = relationship(back_populates="politician", lazy="selectin")


class PoliticianRole(Base):
    __tablename__ = "politician_roles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    politician_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("politicians.id", ondelete="CASCADE"))
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"))
    party_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("parties.id"))
    role_title: Mapped[str] = mapped_column(Text, nullable=False)
    started_at: Mapped[date] = mapped_column(Date, nullable=False)
    ended_at: Mapped[Optional[date]] = mapped_column(Date)
    district: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    politician: Mapped["Politician"] = relationship(back_populates="roles")


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    session_number: Mapped[Optional[str]] = mapped_column(Text)
    session_type: Mapped[Optional[str]] = mapped_column(Text)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(SessionStatusEnum, default="scheduled")
    video_url: Mapped[Optional[str]] = mapped_column(Text)
    transcript_url: Mapped[Optional[str]] = mapped_column(Text)
    transcript_raw: Mapped[Optional[str]] = mapped_column(Text)
    processing_status: Mapped[str] = mapped_column(Text, default="pending")
    speech_count: Mapped[int] = mapped_column(Integer, default=0)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[Optional[str]] = mapped_column(SourceTypeEnum, default="transcript")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SessionAttendance(Base):
    __tablename__ = "session_attendance"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"))
    politician_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("politicians.id"))
    status: Mapped[str] = mapped_column(Text, nullable=False)
    interventions: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("session_id", "politician_id"),)


class Speech(Base):
    __tablename__ = "speeches"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"))
    politician_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("politicians.id"))
    speaker_label: Mapped[Optional[str]] = mapped_column(Text)
    transcript: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[Optional[int]] = mapped_column(Integer)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    start_time: Mapped[Optional[float]] = mapped_column(Float)
    end_time: Mapped[Optional[float]] = mapped_column(Float)
    sequence_order: Mapped[Optional[int]] = mapped_column(Integer)
    source: Mapped[Optional[str]] = mapped_column(SourceTypeEnum, default="transcript")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SpeechAnalysis(Base):
    __tablename__ = "speech_analysis"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    speech_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("speeches.id", ondelete="CASCADE"), unique=True)
    topic: Mapped[Optional[str]] = mapped_column(Text)
    topic_cluster: Mapped[Optional[str]] = mapped_column(Text)
    policy_area: Mapped[Optional[str]] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    stance: Mapped[Optional[str]] = mapped_column(StanceTypeEnum)
    sentiment: Mapped[Optional[str]] = mapped_column(SentimentTypeEnum)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    keywords: Mapped[Optional[list]] = mapped_column(ARRAY(Text))
    named_entities: Mapped[Optional[dict]] = mapped_column(JSONB)
    claims: Mapped[Optional[dict]] = mapped_column(JSONB)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    model_used: Mapped[Optional[str]] = mapped_column(Text)
    raw_llm_output: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Bill(Base):
    __tablename__ = "bills"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    number: Mapped[Optional[str]] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    full_text_url: Mapped[Optional[str]] = mapped_column(Text)
    policy_area: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(BillStatusEnum, default="draft")
    introduced_at: Mapped[Optional[date]] = mapped_column(Date)
    enacted_at: Mapped[Optional[date]] = mapped_column(Date)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[Optional[str]] = mapped_column(SourceTypeEnum, default="xml_api")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class BillAuthor(Base):
    __tablename__ = "bill_authors"
    bill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bills.id", ondelete="CASCADE"), primary_key=True)
    politician_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("politicians.id"), primary_key=True)
    role: Mapped[str] = mapped_column(Text, default="author")


class BillStage(Base):
    __tablename__ = "bill_stages"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    bill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bills.id", ondelete="CASCADE"))
    stage_name: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[Optional[str]] = mapped_column(Text)
    occurred_at: Mapped[Optional[date]] = mapped_column(Date)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Vote(Base):
    __tablename__ = "votes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"))
    bill_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("bills.id"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    vote_type: Mapped[Optional[str]] = mapped_column(Text)
    result: Mapped[Optional[str]] = mapped_column(Text)
    yes_count: Mapped[int] = mapped_column(Integer, default=0)
    no_count: Mapped[int] = mapped_column(Integer, default=0)
    abstain_count: Mapped[int] = mapped_column(Integer, default=0)
    absent_count: Mapped[int] = mapped_column(Integer, default=0)
    voted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class VotePosition(Base):
    __tablename__ = "vote_positions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    vote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("votes.id", ondelete="CASCADE"))
    politician_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("politicians.id"))
    position: Mapped[str] = mapped_column(VotePositionEnum, nullable=False)
    party_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("parties.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("vote_id", "politician_id"),)


class Topic(Base):
    __tablename__ = "topics"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    policy_area: Mapped[Optional[str]] = mapped_column(Text)
    parent_topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("topics.id"))
    color_hex: Mapped[Optional[str]] = mapped_column(Text)
    hero_image_url: Mapped[Optional[str]] = mapped_column(Text)
    mention_count: Mapped[int] = mapped_column(Integer, default=0)
    speech_count: Mapped[int] = mapped_column(Integer, default=0)
    bill_count: Mapped[int] = mapped_column(Integer, default=0)
    momentum_score: Mapped[float] = mapped_column(Float, default=0)
    discourse_gap_score: Mapped[Optional[float]] = mapped_column(Float)
    discourse_gap_label: Mapped[Optional[str]] = mapped_column(Text)
    last_calculated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Claim(Base):
    __tablename__ = "claims"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    speech_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("speeches.id", ondelete="CASCADE"))
    politician_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("politicians.id"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    claim_type: Mapped[Optional[str]] = mapped_column(Text)
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("topics.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Narrative(Base):
    __tablename__ = "narratives"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("topics.id"))
    label: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    framing: Mapped[Optional[str]] = mapped_column(Text)
    claim_count: Mapped[int] = mapped_column(Integer, default=0)
    politician_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Committee(Base):
    __tablename__ = "committees"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(Text)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("institution_id", "name"),)


class CommitteeMembership(Base):
    __tablename__ = "committee_memberships"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    committee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("committees.id", ondelete="CASCADE"))
    politician_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("politicians.id"))
    role: Mapped[str] = mapped_column(Text, default="member")
    started_at: Mapped[Optional[date]] = mapped_column(Date)
    ended_at: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("committee_id", "politician_id"),)


class ParliamentaryBloc(Base):
    __tablename__ = "parliamentary_blocs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(Text)
    interbloc_name: Mapped[Optional[str]] = mapped_column(Text)
    president_name: Mapped[Optional[str]] = mapped_column(Text)
    member_count: Mapped[int] = mapped_column(Integer, default=0)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("institution_id", "name"),)


class ExecutiveOfficial(Base):
    __tablename__ = "executive_officials"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    role_title: Mapped[str] = mapped_column(Text, nullable=False)
    ministry: Mapped[Optional[str]] = mapped_column(Text)
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    party_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("parties.id"))
    started_at: Mapped[date] = mapped_column(Date, nullable=False)
    ended_at: Mapped[Optional[date]] = mapped_column(Date)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ExecutiveAction(Base):
    __tablename__ = "executive_actions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    official_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("executive_officials.id"))
    action_type: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    number: Mapped[Optional[str]] = mapped_column(Text)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    full_text: Mapped[Optional[str]] = mapped_column(Text)
    source_url: Mapped[Optional[str]] = mapped_column(Text)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class AssetDeclaration(Base):
    __tablename__ = "asset_declarations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    politician_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("politicians.id"))
    official_name: Mapped[str] = mapped_column(Text, nullable=False)
    declaration_year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_assets: Mapped[Optional[float]] = mapped_column(Numeric(15, 2))
    currency: Mapped[str] = mapped_column(Text, default="ARS")
    source_url: Mapped[Optional[str]] = mapped_column(Text)
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("official_name", "declaration_year"),)


class AssetItem(Base):
    __tablename__ = "asset_items"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    declaration_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_declarations.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    value: Mapped[Optional[float]] = mapped_column(Numeric(15, 2))
    currency: Mapped[str] = mapped_column(Text, default="ARS")
    company_name: Mapped[Optional[str]] = mapped_column(Text)
    ownership_percentage: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ScrapingRun(Base):
    __tablename__ = "scraping_runs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(Text, default="running")
    records_found: Mapped[int] = mapped_column(Integer, default=0)
    records_created: Mapped[int] = mapped_column(Integer, default=0)
    records_updated: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB)
