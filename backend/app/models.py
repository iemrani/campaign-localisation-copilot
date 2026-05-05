from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    ForeignKey, Enum, JSON, Float
)
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    GLOBAL_MARKETING = "GLOBAL_MARKETING"
    LOCAL_MARKET     = "LOCAL_MARKET"
    LEGAL_REVIEW     = "LEGAL_REVIEW"


class VariantStatus(str, enum.Enum):
    DRAFT        = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED     = "APPROVED"
    REJECTED     = "REJECTED"


class WorkflowStep(str, enum.Enum):
    INGEST    = "INGEST"
    LOCALISE  = "LOCALISE"
    CHECK     = "CHECK"
    REVIEW    = "REVIEW"
    TELEMETRY = "TELEMETRY"


class RunStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED  = "FAILED"


# ── Tables ────────────────────────────────────────────────────────────────────

class Campaign(Base):
    __tablename__ = "campaigns"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(200), nullable=False)
    brand               = Column(String(100), default="Lavazza")
    brief_text          = Column(Text, nullable=True)
    guidelines_text     = Column(Text, nullable=True)
    extracted_spec      = Column(JSON, nullable=True)  # output of ingestion agent
    created_at          = Column(DateTime, default=datetime.utcnow)

    variants  = relationship("CampaignVariant", back_populates="campaign")
    run_logs  = relationship("RunLog",          back_populates="campaign")


class Market(Base):
    __tablename__ = "markets"

    id       = Column(Integer, primary_key=True, index=True)
    code     = Column(String(10),  unique=True, nullable=False)  # e.g. "IT", "FR"
    name     = Column(String(100), nullable=False)
    language = Column(String(50),  nullable=False)               # e.g. "Italian"
    timezone = Column(String(50),  default="UTC")

    variants = relationship("CampaignVariant", back_populates="market")


class Channel(Base):
    __tablename__ = "channels"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # email, instagram, pos

    variants = relationship("CampaignVariant", back_populates="channel")


class CampaignVariant(Base):
    __tablename__ = "campaign_variants"

    id             = Column(Integer, primary_key=True, index=True)
    campaign_id    = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    market_id      = Column(Integer, ForeignKey("markets.id"),   nullable=False)
    channel_id     = Column(Integer, ForeignKey("channels.id"),  nullable=False)
    generated_text = Column(Text,    nullable=True)
    status         = Column(Enum(VariantStatus), default=VariantStatus.DRAFT)
    risk_flags     = Column(JSON, default=dict)   # {"missing_disclaimer": true, ...}
    version        = Column(Integer, default=1)
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="variants")
    market   = relationship("Market",   back_populates="variants")
    channel  = relationship("Channel",  back_populates="variants")
    reviews  = relationship("Review",   back_populates="variant")


class Review(Base):
    __tablename__ = "reviews"

    id            = Column(Integer, primary_key=True, index=True)
    variant_id    = Column(Integer, ForeignKey("campaign_variants.id"), nullable=False)
    reviewer_role = Column(Enum(UserRole), nullable=False)
    reviewer_name = Column(String(100), default="anonymous")
    decision      = Column(String(20),  nullable=False)   # "APPROVED" or "REJECTED"
    comments      = Column(Text, nullable=True)
    edited_text   = Column(Text, nullable=True)           # text after human edits
    created_at    = Column(DateTime, default=datetime.utcnow)

    variant = relationship("CampaignVariant", back_populates="reviews")


class RunLog(Base):
    __tablename__ = "run_logs"

    id             = Column(Integer, primary_key=True, index=True)
    campaign_id    = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    step           = Column(Enum(WorkflowStep), nullable=False)
    status         = Column(Enum(RunStatus), default=RunStatus.RUNNING)
    started_at     = Column(DateTime, default=datetime.utcnow)
    finished_at    = Column(DateTime, nullable=True)
    duration_sec   = Column(Float,    nullable=True)
    llm_model      = Column(String(100), nullable=True)
    error_message  = Column(Text,     nullable=True)
    metadata_json  = Column(JSON,     default=dict)

    campaign = relationship("Campaign", back_populates="run_logs")