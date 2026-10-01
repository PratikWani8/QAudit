from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Evidence, CryptographicCommitment, User
from app.schemas.schemas import (
    EvidenceCreate, EvidenceResponse, MerkleProofResponse, CommitmentResponse
)
from app.services.evidence_service import EvidenceService
from app.api.deps import require_role

router = APIRouter()

@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def submit_evidence(
    evidence_in: EvidenceCreate,
    db: Session = Depends(get_db)
):
    try:
        ev = EvidenceService.create_evidence(db, evidence_in)
        return ev
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[EvidenceResponse])
def list_evidence(
    election_id: Optional[str] = None,
    station_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Evidence)
    if election_id:
        query = query.filter(Evidence.election_id == election_id)
    if station_id:
        query = query.filter(Evidence.station_id == station_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(evidence_id: str, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return ev

@router.get("/{evidence_id}/proof", response_model=MerkleProofResponse)
def get_evidence_merkle_proof(evidence_id: str, db: Session = Depends(get_db)):
    try:
        proof_res = EvidenceService.get_evidence_proof(db, evidence_id)
        return proof_res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{evidence_id}/verify")
def verify_single_evidence(evidence_id: str, db: Session = Depends(get_db)):
    try:
        res = EvidenceService.verify_single_evidence(db, evidence_id)
        return res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/elections/{election_id}/commit", response_model=CommitmentResponse)
def commit_election_evidence(
    election_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "ELECTION_AUTHORITY"]))
):
    try:
        commitment = EvidenceService.commit_election_evidence(db, election_id)
        return commitment
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/elections/{election_id}/commitments", response_model=List[CommitmentResponse])
def list_election_commitments(election_id: str, db: Session = Depends(get_db)):
    commits = db.query(CryptographicCommitment).filter(
        CryptographicCommitment.election_id == election_id
    ).order_by(CryptographicCommitment.timestamp.desc()).all()
    return commits

@router.get("/elections/{election_id}/root")
def get_latest_merkle_root(election_id: str, db: Session = Depends(get_db)):
    latest = db.query(CryptographicCommitment).filter(
        CryptographicCommitment.election_id == election_id
    ).order_by(CryptographicCommitment.id.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No cryptographic commitments found for election")
    return {
        "election_id": election_id,
        "commitment_id": latest.commitment_id,
        "merkle_root": latest.merkle_root,
        "signature": latest.signature,
        "algorithm": latest.algorithm,
        "timestamp": latest.timestamp
    }
