from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SecurityEvent, Evidence
from app.schemas.schemas import SecurityEventResponse, DashboardStats
from app.security.attack_service import AttackService
from app.services.verification_service import VerificationService
from app.crypto.canonical import canonicalize_json, sha3_256_hex
from app.crypto.pqc_service import PQCCryptoService

router = APIRouter()

@router.get("/events", response_model=List[SecurityEventResponse])
def get_security_events(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(SecurityEvent).order_by(SecurityEvent.detected_at.desc()).offset(skip).limit(limit).all()
    return events

@router.post("/attacks/tamper-evidence")
def attack_tamper_evidence(
    evidence_id: str,
    tampered_field: str = "voter_turnout",
    tampered_value: int = 9999,
    db: Session = Depends(get_db)
):
    """
    Attack Lab 1: Simulates adversary directly altering database evidence record.
    Demonstrates content hash mismatch and Merkle proof failure!
    """
    try:
        res = AttackService.simulate_database_tampering(db, evidence_id, tampered_field, tampered_value)
        return res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/attacks/forge-evidence")
def attack_forge_evidence(
    election_id: str,
    station_id: str = "ROGUE-STATION-666",
    db: Session = Depends(get_db)
):
    """
    Attack Lab 2: Simulates adversary submitting forged evidence with fake ML-DSA signature.
    Demonstrates instant cryptographic rejection.
    """
    return AttackService.simulate_forged_evidence(db, election_id, station_id)

@router.post("/attacks/restore-evidence")
def restore_evidence(evidence_id: str, db: Session = Depends(get_db)):
    """
    Convenience method to restore tampered evidence record back to legitimate state.
    """
    ev = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Restore default clean payload and status
    clean_payload = dict(ev.payload)
    if "voter_turnout" in clean_payload and clean_payload["voter_turnout"] == 9999:
        clean_payload["voter_turnout"] = 42
    ev.payload = clean_payload
    ev.content_hash = sha3_256_hex(canonicalize_json(clean_payload))
    ev.signature = PQCCryptoService.sign_message(
        bytes.fromhex(ev.content_hash),
        ev.signing_key_id or "STATION-EDG-KEY-001"
    )
    ev.status = "VERIFIED"
    db.commit()
    db.refresh(ev)
    return {"status": "RESTORED", "evidence_id": evidence_id, "content_hash": ev.content_hash}

@router.get("/verification/{election_id}")
def run_public_verification(
    election_id: str,
    evidence_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Flagship Public Verification Portal Endpoint:
    Returns full cryptographic verification report for any citizen or auditor.
    """
    try:
        report = VerificationService.full_public_verification(db, election_id, evidence_id)
        return report
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
