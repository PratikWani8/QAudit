from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Nullifier
from app.schemas.schemas import (
    ZKProofSubmit, ZKProofVerifyResponse, NullifierSubmit, NullifierResponse
)
from app.zk.zk_service import ZKPrivacyService

router = APIRouter()

@router.post("/generate-credential")
def generate_anonymous_credential(voter_secret: str, election_id: str):
    """Client-side / ID-provider simulation: generates credential commitment and election nullifier."""
    return ZKPrivacyService.generate_anonymous_credential(voter_secret, election_id)

@router.post("/create-proof")
def create_zk_proof(voter_secret: str, election_id: str):
    """Generates non-interactive zero-knowledge proof of knowledge."""
    return ZKPrivacyService.create_zk_proof(voter_secret, election_id)

@router.post("/verify-eligibility", response_model=ZKProofVerifyResponse)
def verify_zk_eligibility(req: ZKProofSubmit):
    """
    Independent Zero-Knowledge verification:
    Confirms voter possesses eligible credential without revealing voter identity or secret key.
    """
    is_valid, msg = ZKPrivacyService.verify_zk_proof(req.proof_data, req.election_id)
    return ZKProofVerifyResponse(
        is_valid=is_valid,
        verified_at=datetime.utcnow(),
        message=msg,
        election_id=req.election_id,
        identity_revealed=False,
        proof_system="Sigma-Protocol / Fiat-Shamir Heuristic (Zero Knowledge Proof of Secret Key Possession)"
    )

@router.post("/nullifier", response_model=NullifierResponse)
def submit_nullifier(req: NullifierSubmit, db: Session = Depends(get_db)):
    """
    Submits an election nullifier.
    Enforces that each anonymous credential can only participate once per election.
    """
    res = ZKPrivacyService.process_nullifier(db, req.election_id, req.nullifier_hash)
    return res

@router.get("/nullifiers/{election_id}")
def list_election_nullifiers(election_id: str, db: Session = Depends(get_db)):
    """Public transparency log of recorded nullifiers for an election."""
    nullifiers = db.query(Nullifier).filter(Nullifier.election_id == election_id).all()
    return [
        {
            "nullifier_hash": n.nullifier_hash,
            "election_id": n.election_id,
            "first_seen_at": n.first_seen_at,
            "status": n.status
        }
        for n in nullifiers
    ]
