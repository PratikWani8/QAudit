from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Election, Evidence, AuditRun, Validator, SecurityEvent
from app.schemas.schemas import DashboardStats
from app.validators.validator_service import ValidatorService

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    ValidatorService.ensure_default_validators(db)

    total_elections = db.query(Election).count()
    active_elections = db.query(Election).filter(Election.status.in_(["LOCKED", "ACTIVE"])).count()
    evidence_records = db.query(Evidence).count()
    verified_evidence = db.query(Evidence).filter(Evidence.status == "VERIFIED").count()
    audit_runs = db.query(AuditRun).count()
    validators_online = db.query(Validator).filter(Validator.status == "ONLINE").count()
    total_validators = db.query(Validator).count()
    security_alerts = db.query(SecurityEvent).count()
    tampering_attempts = db.query(SecurityEvent).filter(
        SecurityEvent.event_type.in_(["TAMPERING_ATTEMPT", "FORGED_SIGNATURE", "DUPLICATE_NULLIFIER"])
    ).count()

    return DashboardStats(
        total_elections=total_elections,
        active_elections=active_elections,
        evidence_records=evidence_records,
        verified_evidence=verified_evidence,
        audit_runs=audit_runs,
        validators_online=validators_online,
        total_validators=total_validators,
        security_alerts=security_alerts,
        tampering_attempts=tampering_attempts
    )
