import pytest
from datetime import datetime, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.models import User, Election
from app.schemas.schemas import ElectionCreate, CandidateCreate, PollingStationCreate
from app.services.election_service import ElectionService
from app.core.security import get_password_hash, create_access_token

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_election_creation_and_locking(db):
    # Setup test election
    e_id = f"TEST-ELEC-{int(datetime.utcnow().timestamp())}"
    election_in = ElectionCreate(
        election_id=e_id,
        name="National Verification Test Election 2026",
        jurisdiction="Federal District 01",
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(days=1),
        candidates=[
            CandidateCreate(candidate_id="CAN-01", public_metadata={"name": "Alice Green", "party": "Alliance"}),
            CandidateCreate(candidate_id="CAN-02", public_metadata={"name": "Bob Stone", "party": "Liberty"}),
        ],
        polling_stations=[
            PollingStationCreate(station_id="STATION-001", device_commitment="DEV-COMMIT-ABC1234"),
            PollingStationCreate(station_id="STATION-002", device_commitment="DEV-COMMIT-XYZ5678"),
        ]
    )

    created = ElectionService.create_election(db, election_in)
    assert created.election_id == e_id
    assert created.status == "DRAFT"
    assert len(created.candidates) == 2
    assert len(created.polling_stations) == 2

    # Lock the election configuration
    lock_res = ElectionService.lock_election(db, e_id)
    assert lock_res["status"] == "LOCKED"
    assert lock_res["configuration_hash"] is not None
    assert lock_res["signature"] is not None
    assert lock_res["algorithm"] == "SHA3-256 + ML-DSA-44 (Dilithium2 / FIPS 204)"

    # Verify election configuration cryptographically
    verify_res = ElectionService.verify_election_config(db, e_id)
    assert verify_res["is_signature_valid"] is True
    assert verify_res["configuration_hash"] == lock_res["configuration_hash"]
    print("\nPhase 2 Election locking and ML-DSA verification passed successfully!")
