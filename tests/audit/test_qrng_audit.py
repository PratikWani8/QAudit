import pytest
from datetime import datetime
from app.database.session import SessionLocal, Base, engine
from app.schemas.schemas import ElectionCreate, CandidateCreate, PollingStationCreate, AuditCreate, AuditReproduceRequest
from app.services.election_service import ElectionService
from app.services.evidence_service import EvidenceService
from app.audits.audit_service import AuditService
from app.qrng.qrng_service import QRNGService

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_qrng_entropy_and_commitment():
    entropy, is_quantum, source = QRNGService.get_entropy()
    assert len(entropy) == 64
    commit = QRNGService.get_entropy_commitment(entropy)
    assert len(commit) == 64
    assert source is not None

def test_deterministic_audit_selection_and_reproducibility(db):
    e_id = f"TEST-AUDIT-{int(datetime.utcnow().timestamp())}"
    election_in = ElectionCreate(
        election_id=e_id,
        name="Deterministic Audit Test Election",
        jurisdiction="Province Alpha",
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow(),
        candidates=[CandidateCreate(candidate_id="C1", public_metadata={"name": "Alice"})],
        polling_stations=[PollingStationCreate(station_id=f"ST-{i:03d}", device_commitment=f"DEV-{i}") for i in range(1, 21)]
    )
    ElectionService.create_election(db, election_in)
    ElectionService.lock_election(db, e_id)

    # Run audit with 5 samples
    audit_res = AuditService.run_audit(
        db,
        AuditCreate(election_id=e_id, sample_size=5, force_fallback=True)
    )
    assert audit_res.status == "COMPLETED"
    assert len(audit_res.samples) == 5
    original_stations = [s.station_id for s in audit_res.samples]

    # Now run independent reproduction using the exact same public commitment & raw entropy
    reproduce_res = AuditService.reproduce_audit(
        db,
        AuditReproduceRequest(
            election_id=e_id,
            raw_entropy=audit_res.raw_entropy,
            public_commitment=audit_res.election_commitment,
            sample_size=5
        )
    )
    assert reproduce_res.reproduced_samples == original_stations
    print(f"\nPhase 6 QRNG Audit successfully reproduced: {original_stations} matches 100%!")
