from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import AuditRun, AuditSample, User
from app.schemas.schemas import AuditCreate, AuditResponse, AuditSampleItem, AuditReproduceRequest, AuditReproduceResponse
from app.audits.audit_service import AuditService
from app.qrng.qrng_service import QRNGService
from app.api.deps import require_role

router = APIRouter()

@router.post("", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
def start_audit(
    audit_in: AuditCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "ELECTION_AUTHORITY", "AUDITOR"]))
):
    try:
        audit_res = AuditService.run_audit(db, audit_in)
        return audit_res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{audit_id}", response_model=AuditResponse)
def get_audit(audit_id: str, db: Session = Depends(get_db)):
    audit = db.query(AuditRun).filter(AuditRun.audit_id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit run not found")

    sample_items = [
        AuditSampleItem(
            station_id=s.station_id,
            evidence_reference=s.evidence_reference,
            selection_proof=s.selection_proof
        )
        for s in audit.samples
    ]

    return AuditResponse(
        audit_id=audit.audit_id,
        election_id=audit.election_id,
        entropy_commitment=audit.entropy_commitment,
        audit_seed_commitment=audit.audit_seed_commitment,
        algorithm_version=audit.algorithm_version,
        status=audit.status,
        created_at=audit.created_at,
        raw_entropy=audit.raw_entropy,
        samples=sample_items,
        is_quantum_true=False,
        qrng_source="Quantum Entropy Register"
    )

@router.get("/election/{election_id}", response_model=List[AuditResponse])
def get_election_audits(election_id: str, db: Session = Depends(get_db)):
    audits = db.query(AuditRun).filter(AuditRun.election_id == election_id).order_by(AuditRun.created_at.desc()).all()
    results = []
    for a in audits:
        samples = [
            AuditSampleItem(
                station_id=s.station_id,
                evidence_reference=s.evidence_reference,
                selection_proof=s.selection_proof
            )
            for s in a.samples
        ]
        results.append(AuditResponse(
            audit_id=a.audit_id,
            election_id=a.election_id,
            entropy_commitment=a.entropy_commitment,
            audit_seed_commitment=a.audit_seed_commitment,
            algorithm_version=a.algorithm_version,
            status=a.status,
            created_at=a.created_at,
            raw_entropy=a.raw_entropy,
            samples=samples,
            is_quantum_true=False,
            qrng_source="Quantum Entropy Register"
        ))
    return results

@router.post("/reproduce", response_model=AuditReproduceResponse)
def reproduce_audit(req: AuditReproduceRequest, db: Session = Depends(get_db)):
    try:
        return AuditService.reproduce_audit(db, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/qrng/sample")
def get_qrng_sample():
    """Live endpoint to test quantum entropy generation."""
    entropy, is_quantum, source = QRNGService.get_entropy()
    commitment = QRNGService.get_entropy_commitment(entropy)
    return {
        "entropy_hex": entropy,
        "entropy_commitment": commitment,
        "is_genuine_quantum": is_quantum,
        "source": source,
        "algorithm": "QRNG Vacuum Fluctuations + SHA3-256 Commitment"
    }
