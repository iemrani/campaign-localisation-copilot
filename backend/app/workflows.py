from datetime import datetime
from sqlalchemy.orm import Session

from .config import settings
from .llm_client import LLMClient
from .models import (
    Campaign,
    CampaignVariant,
    Channel,
    Market,
    Review,
    RunLog,
    RunStatus,
    VariantStatus,
    WorkflowStep,
)

llm = LLMClient()


def _start_run(db: Session, campaign_id: int, step: WorkflowStep) -> RunLog:
    run = RunLog(
        campaign_id=campaign_id,
        step=step,
        status=RunStatus.RUNNING,
        started_at=datetime.utcnow(),
        llm_model=settings.claude_model if settings.llm_provider == "claude" else settings.llm_provider,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def _finish_run(db: Session, run: RunLog, status: RunStatus, error_message: str | None = None):
    run.status = status
    run.finished_at = datetime.utcnow()
    run.duration_sec = (run.finished_at - run.started_at).total_seconds()
    run.error_message = error_message
    db.add(run)
    db.commit()


def run_ingestion(db: Session, campaign_id: int):
    run = _start_run(db, campaign_id, WorkflowStep.INGEST)
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            raise ValueError("Campaign not found")

        spec = llm.extract_campaign_spec(
            brief_text=campaign.brief_text or "",
            guidelines_text=campaign.guidelines_text or "",
        )
        campaign.extracted_spec = spec
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        _finish_run(db, run, RunStatus.SUCCESS)
        return campaign
    except Exception as e:
        _finish_run(db, run, RunStatus.FAILED, str(e))
        raise


def run_localisation(db: Session, campaign_id: int, market_id: int, channel_id: int):
    run = _start_run(db, campaign_id, WorkflowStep.LOCALISE)
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        market = db.query(Market).filter(Market.id == market_id).first()
        channel = db.query(Channel).filter(Channel.id == channel_id).first()

        if not campaign:
            raise ValueError("Campaign not found")
        if not market:
            raise ValueError("Market not found")
        if not channel:
            raise ValueError("Channel not found")
        if not campaign.extracted_spec:
            raise ValueError("Campaign spec not found. Run ingestion first.")

        result = llm.generate_local_copy(
            spec=campaign.extracted_spec,
            market_name=market.name,
            language=market.language,
            channel_name=channel.name,
        )

        variant = CampaignVariant(
            campaign_id=campaign.id,
            market_id=market.id,
            channel_id=channel.id,
            generated_text=result.get("generated_text"),
            risk_flags=result.get("risk_flags", {}),
            status=VariantStatus.DRAFT,
            version=1,
        )
        db.add(variant)
        db.commit()
        db.refresh(variant)

        _finish_run(db, run, RunStatus.SUCCESS)
        return variant
    except Exception as e:
        _finish_run(db, run, RunStatus.FAILED, str(e))
        raise


def run_compliance_check(db: Session, variant_id: int):
    variant = db.query(CampaignVariant).filter(CampaignVariant.id == variant_id).first()
    if not variant:
        raise ValueError("Variant not found")

    run = _start_run(db, variant.campaign_id, WorkflowStep.CHECK)
    try:
        result = llm.check_compliance(variant.generated_text or "")
        variant.risk_flags = result.get("risk_flags", {})
        db.add(variant)
        db.commit()
        db.refresh(variant)

        _finish_run(db, run, RunStatus.SUCCESS)
        return {
            "variant_id": variant.id,
            "risk_flags": variant.risk_flags,
            "suggestions": result.get("suggestions", []),
        }
    except Exception as e:
        _finish_run(db, run, RunStatus.FAILED, str(e))
        raise


def submit_for_review(db: Session, variant_id: int):
    variant = db.query(CampaignVariant).filter(CampaignVariant.id == variant_id).first()
    if not variant:
        raise ValueError("Variant not found")

    variant.status = VariantStatus.UNDER_REVIEW
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


def record_review(db: Session, variant_id: int, reviewer_role, reviewer_name: str, decision: str, comments: str | None, edited_text: str | None):
    variant = db.query(CampaignVariant).filter(CampaignVariant.id == variant_id).first()
    if not variant:
        raise ValueError("Variant not found")

    run = _start_run(db, variant.campaign_id, WorkflowStep.REVIEW)
    try:
        review = Review(
            variant_id=variant_id,
            reviewer_role=reviewer_role,
            reviewer_name=reviewer_name,
            decision=decision,
            comments=comments,
            edited_text=edited_text,
        )
        db.add(review)

        if edited_text:
            variant.generated_text = edited_text
            variant.version += 1

        variant.status = VariantStatus.APPROVED if decision.upper() == "APPROVED" else VariantStatus.REJECTED

        db.add(variant)
        db.commit()
        db.refresh(review)
        db.refresh(variant)

        _finish_run(db, run, RunStatus.SUCCESS)
        return review
    except Exception as e:
        _finish_run(db, run, RunStatus.FAILED, str(e))
        raise


def compute_telemetry(db: Session, campaign_id: int):
    variants = db.query(CampaignVariant).filter(CampaignVariant.campaign_id == campaign_id).all()
    runs = db.query(RunLog).filter(RunLog.campaign_id == campaign_id).all()

    total_variants = len(variants)
    approved = len([v for v in variants if v.status == VariantStatus.APPROVED])
    rejected = len([v for v in variants if v.status == VariantStatus.REJECTED])
    under_review = len([v for v in variants if v.status == VariantStatus.UNDER_REVIEW])

    localise_runs = [r for r in runs if r.step == WorkflowStep.LOCALISE and r.duration_sec is not None]
    review_runs = [r for r in runs if r.step == WorkflowStep.REVIEW and r.duration_sec is not None]

    avg_time_to_draft_sec = sum(r.duration_sec for r in localise_runs) / len(localise_runs) if localise_runs else None
    avg_time_to_approval_sec = sum(r.duration_sec for r in review_runs) / len(review_runs) if review_runs else None
    avg_revisions = sum(v.version for v in variants) / len(variants) if variants else None

    return {
        "campaign_id": campaign_id,
        "total_variants": total_variants,
        "approved": approved,
        "rejected": rejected,
        "under_review": under_review,
        "avg_time_to_draft_sec": avg_time_to_draft_sec,
        "avg_time_to_approval_sec": avg_time_to_approval_sec,
        "avg_revisions": avg_revisions,
    }