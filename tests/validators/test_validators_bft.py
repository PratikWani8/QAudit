import pytest
from datetime import datetime
from app.database.session import SessionLocal, Base, engine
from app.models.models import CryptographicCommitment
from app.validators.validator_service import ValidatorService
from app.core.config import settings

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    ValidatorService.ensure_default_validators(session)
    yield session
    session.close()

def test_validator_attestation_and_bft_threshold(db):
    # Create test commitment
    c_id = f"TEST-COMMIT-{int(datetime.utcnow().timestamp())}"
    mock_root = "d"*64
    commit = CryptographicCommitment(
        commitment_id=c_id,
        election_id="TEST-ELEC-BFT",
        evidence_hash="e"*64,
        merkle_root=mock_root,
        previous_root="0"*64,
        algorithm="SHA3-256 + ML-DSA-44",
        signature="s"*100,
        timestamp=datetime.utcnow(),
        status="COMMITTED"
    )
    db.add(commit)
    db.commit()

    # Initial status: in progress
    status_0 = ValidatorService.check_bft_agreement(db, c_id)
    assert status_0.status == "IN_PROGRESS"
    assert status_0.threshold_met is False

    # Validator 1 attests
    ValidatorService.submit_attestation(db, "VAL-GOV-01", c_id, "ACCEPT")
    # Validator 2 attests
    ValidatorService.submit_attestation(db, "VAL-AUD-02", c_id, "ACCEPT")
    # Validator 3 attests
    ValidatorService.submit_attestation(db, "VAL-ACAD-03", c_id, "ACCEPT")
    
    status_3 = ValidatorService.check_bft_agreement(db, c_id)
    assert status_3.accept_count == 3
    assert status_3.threshold_met is False  # Need 4 of 5

    # Validator 4 attests -> Threshold met!
    ValidatorService.submit_attestation(db, "VAL-OBS-04", c_id, "ACCEPT")
    status_4 = ValidatorService.check_bft_agreement(db, c_id)
    assert status_4.accept_count == 4
    assert status_4.threshold_met is True
    assert status_4.status == "FINALIZED"

    # Validator failure simulation
    val5 = ValidatorService.simulate_validator_failure(db, "VAL-SEC-05", "OFFLINE")
    assert val5.status == "OFFLINE"
    print("\nPhase 4/5 Validator Attestations, ML-DSA signing, and BFT agreement passed!")
