from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel
from .models import UserRole, VariantStatus, WorkflowStep, RunStatus


# ── Campaign ──────────────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name:             str
    brand:            str = "Lavazza"
    brief_text:       Optional[str] = None
    guidelines_text:  Optional[str] = None

class CampaignRead(BaseModel):
    id:              int
    name:            str
    brand:           str
    extracted_spec:  Optional[dict] = None
    created_at:      datetime

    class Config:
        from_attributes = True


# ── Market ────────────────────────────────────────────────────────────────────

class MarketRead(BaseModel):
    id:       int
    code:     str
    name:     str
    language: str

    class Config:
        from_attributes = True


# ── Channel ───────────────────────────────────────────────────────────────────

class ChannelRead(BaseModel):
    id:   int
    name: str

    class Config:
        from_attributes = True


# ── Variant ───────────────────────────────────────────────────────────────────

class VariantRead(BaseModel):
    id:             int
    campaign_id:    int
    market_id:      int
    channel_id:     int
    generated_text: Optional[str] = None
    status:         VariantStatus
    risk_flags:     Any
    version:        int
    created_at:     datetime

    class Config:
        from_attributes = True


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    reviewer_role: UserRole
    reviewer_name: str = "anonymous"
    decision:      str            # "APPROVED" or "REJECTED"
    comments:      Optional[str] = None
    edited_text:   Optional[str] = None

class ReviewRead(BaseModel):
    id:            int
    variant_id:    int
    reviewer_role: UserRole
    reviewer_name: str
    decision:      str
    comments:      Optional[str] = None
    created_at:    datetime

    class Config:
        from_attributes = True


# ── RunLog ────────────────────────────────────────────────────────────────────

class RunLogRead(BaseModel):
    id:            int
    campaign_id:   int
    step:          WorkflowStep
    status:        RunStatus
    started_at:    datetime
    finished_at:   Optional[datetime] = None
    duration_sec:  Optional[float]    = None
    llm_model:     Optional[str]      = None
    error_message: Optional[str]      = None

    class Config:
        from_attributes = True


# ── Localisation request ──────────────────────────────────────────────────────

class LocalisationRequest(BaseModel):
    campaign_id: int
    market_id:   int
    channel_id:  int


# ── Telemetry ─────────────────────────────────────────────────────────────────

class TelemetryRead(BaseModel):
    campaign_id:          int
    total_variants:       int
    approved:             int
    rejected:             int
    under_review:         int
    avg_time_to_draft_sec:    Optional[float] = None
    avg_time_to_approval_sec: Optional[float] = None
    avg_revisions:            Optional[float] = None