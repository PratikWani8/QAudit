import pytest
from datetime import datetime
from app.database.session import SessionLocal, Base, engine
from app.zk.zk_service import ZKPrivacyService
from app.models.models import Nullifier, SecurityEvent

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_zk_proof_generation_and_verification():
    voter_secret = "citizen_national_id_secret_998877"
    election_id = "ELEC-ZK-2026"

    # Generate credential
    cred = ZKPrivacyService.generate_anonymous_credential(voter_secret, election_id)
    assert cred["nullifier_hash"] is not None
    assert cred["credential_commitment"] is not None

    # Generate Zero-Knowledge Proof
    proof = ZKPrivacyService.create_zk_proof(voter_secret, election_id)
    assert proof["commitment_t"] is not None
    assert proof["response_s"] is not None

    # Verify ZK Proof (must succeed)
    is_valid, msg = ZKPrivacyService.verify_zk_proof(proof, election_id)
    assert is_valid is True

    # Tamper with response_s in proof -> must fail!
    tampered_proof = dict(proof)
    tampered_proof["response_s"] = hex(int(proof["response_s"], 16) + 1)
    is_valid_bad, msg_bad = ZKPrivacyService.verify_zk_proof(tampered_proof, election_id)
    assert is_valid_bad is False

def test_nullifier_single_use_and_duplicate_rejection(db):
    election_id = f"ELEC-NUL-{int(datetime.utcnow().timestamp())}"
    voter_secret = "citizen_secret_token_12345"

    cred = ZKPrivacyService.generate_anonymous_credential(voter_secret, election_id)
    nullifier_hash = cred["nullifier_hash"]

    # 1. First submission: ACCEPTED
    res1 = ZKPrivacyService.process_nullifier(db, election_id, nullifier_hash)
    assert res1["status"] == "ACCEPTED"

    # 2. Second submission with the same nullifier: DUPLICATE_REJECTED
    res2 = ZKPrivacyService.process_nullifier(db, election_id, nullifier_hash)
    assert res2["status"] == "DUPLICATE_REJECTED"
    assert "already been recorded" in res2["message"]

    # Check security event logged
    event = db.query(SecurityEvent).filter(
        SecurityEvent.event_type == "DUPLICATE_NULLIFIER"
    ).order_by(SecurityEvent.id.desc()).first()
    assert event is not None
    assert event.details["nullifier_hash"] == nullifier_hash
    print("\nPhase 7 Zero-Knowledge Privacy and Nullifier tests passed successfully!")
