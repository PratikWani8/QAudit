from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Validator, CryptographicCommitment, ValidatorAttestation
from app.schemas.schemas import (
    ValidatorResponse, AttestationCreate, AttestationResponse, BFTAgreementStatus, CommitmentResponse
)
from app.validators.validator_service import ValidatorService

router = APIRouter()

@router.get("", response_model=List[ValidatorResponse])
def get_validators(db: Session = Depends(get_db)):
    ValidatorService.ensure_default_validators(db)
    validators = db.query(Validator).all()
    return validators

@router.post("/{validator_id}/attest", response_model=AttestationResponse)
def submit_attestation(
    validator_id: str,
    attestation_in: AttestationCreate,
    db: Session = Depends(get_db)
):
    try:
        att = ValidatorService.submit_attestation(
            db,
            validator_id=validator_id,
            commitment_id=attestation_in.commitment_id,
            decision=attestation_in.decision,
            signature=attestation_in.signature
        )
        return att
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/commitments/{commitment_id}/bft-status", response_model=BFTAgreementStatus)
def get_bft_status(commitment_id: str, db: Session = Depends(get_db)):
    try:
        status_res = ValidatorService.check_bft_agreement(db, commitment_id)
        return status_res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/pending-commitments", response_model=List[CommitmentResponse])
def get_pending_commitments(validator_id: str, db: Session = Depends(get_db)):
    """Finds commitments that this validator has not yet attested to."""
    attested_ids = db.query(ValidatorAttestation.commitment_id).filter(
        ValidatorAttestation.validator_id == validator_id
    ).all()
    attested_set = {a[0] for a in attested_ids}

    all_commits = db.query(CryptographicCommitment).all()
    pending = [c for c in all_commits if c.commitment_id not in attested_set]
    return pending

@router.post("/{validator_id}/heartbeat")
def validator_heartbeat(validator_id: str, db: Session = Depends(get_db)):
    val = db.query(Validator).filter(Validator.validator_id == validator_id).first()
    if not val:
        raise HTTPException(status_code=404, detail="Validator not found")
    val.last_seen = datetime.utcnow()
    db.commit()
    return {"status": "ok", "last_seen": val.last_seen}

@router.post("/{validator_id}/simulate-failure", response_model=ValidatorResponse)
def simulate_failure(
    validator_id: str,
    new_status: str,
    db: Session = Depends(get_db)
):
    """Attack Lab: simulate taking a validator node OFFLINE or BYZANTINE."""
    try:
        val = ValidatorService.simulate_validator_failure(db, validator_id, new_status.upper())
        return val
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
