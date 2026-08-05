from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from .database import create_db_and_tables, get_db, SessionLocal
from .models import Campaign, Channel, Market
from .schemas import (
    CampaignCreate,
    CampaignRead,
    LocalisationRequest,
    ReviewCreate,
    ReviewRead,
    RunLogRead,
    TelemetryRead,
    VariantRead,
)
from .workflows import (
    compute_telemetry,
    record_review,
    run_compliance_check,
    run_ingestion,
    run_localisation,
    submit_for_review,
)

app = FastAPI(title="Campaign Localisation Copilot")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_reference_data()


def seed_reference_data():
    db = SessionLocal()
    try:
        if db.query(Market).count() == 0:
            db.add_all([
                Market(code="IT", name="Italy", language="Italian", timezone="Europe/Rome"),
                Market(code="FR", name="France", language="French", timezone="Europe/Paris"),
                Market(code="DE", name="Germany", language="German", timezone="Europe/Berlin"),
            ])
        if db.query(Channel).count() == 0:
            db.add_all([
                Channel(name="email"),
                Channel(name="instagram"),
                Channel(name="pos"),
            ])
        db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/campaigns", response_model=CampaignRead)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(
        name=payload.name,
        brand=payload.brand,
        brief_text=payload.brief_text,
        guidelines_text=payload.guidelines_text,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@app.get("/campaigns", response_model=list[CampaignRead])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).order_by(Campaign.id.desc()).all()


@app.post("/campaigns/{campaign_id}/ingest", response_model=CampaignRead)
def ingest_campaign(campaign_id: int, db: Session = Depends(get_db)):
    try:
        return run_ingestion(db, campaign_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/localise", response_model=VariantRead)
def localise_campaign(payload: LocalisationRequest, db: Session = Depends(get_db)):
    try:
        return run_localisation(db, payload.campaign_id, payload.market_id, payload.channel_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/variants/{variant_id}/check")
def check_variant(variant_id: int, db: Session = Depends(get_db)):
    try:
        return run_compliance_check(db, variant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/variants/{variant_id}/submit", response_model=VariantRead)
def submit_variant(variant_id: int, db: Session = Depends(get_db)):
    try:
        return submit_for_review(db, variant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/variants/{variant_id}/review", response_model=ReviewRead)
def review_variant(variant_id: int, payload: ReviewCreate, db: Session = Depends(get_db)):
    try:
        return record_review(
            db=db,
            variant_id=variant_id,
            reviewer_role=payload.reviewer_role,
            reviewer_name=payload.reviewer_name,
            decision=payload.decision,
            comments=payload.comments,
            edited_text=payload.edited_text,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/campaigns/{campaign_id}/telemetry", response_model=TelemetryRead)
def get_campaign_telemetry(campaign_id: int, db: Session = Depends(get_db)):
    return compute_telemetry(db, campaign_id)


@app.get("/run-logs/{campaign_id}", response_model=list[RunLogRead])
def get_run_logs(campaign_id: int, db: Session = Depends(get_db)):
    from .models import RunLog
    return db.query(RunLog).filter(RunLog.campaign_id == campaign_id).order_by(RunLog.id.desc()).all()


@app.get("/markets")
def list_markets(db: Session = Depends(get_db)):
    return db.query(Market).all()


@app.get("/channels")
def list_channels(db: Session = Depends(get_db)):
    return db.query(Channel).all()

from .models import CampaignVariant

@app.get("/campaigns/{campaign_id}/variants", response_model=list[VariantRead])
def get_campaign_variants(campaign_id: int, db: Session = Depends(get_db)):
    return db.query(CampaignVariant).filter(CampaignVariant.campaign_id == campaign_id).all()