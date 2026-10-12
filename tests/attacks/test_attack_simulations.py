import pytest
from datetime import datetime, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.models import Election, Evidence, Validator, SecurityEvent
from app.schemas.schemas import ElectionCreate, EvidenceCreate, CandidateCreate, PollingStationCreate
from app.services.election_service import ElectionService
from app.services.evidence_service import EvidenceService
from app.validators.validator_service import ValidatorService
from app.security.attack_service import AttackService
from app.services.verification_service import VerificationService

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    ValidatorService.ensure_default_validators(session)
    yield session
    session.close()

def test_attack_database_evidence_tampering(db):
    e_id = f"ATK-ELEC-{int(datetime.utcnow().timestamp())}"
    election_in = ElectionCreate(
        election_id=e_id,
        name="Attack Demonstration Election",
        jurisdiction="Cyber District 0",
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(days=1),
        candidates=[CandidateCreate(candidate_id="C1", public_metadata={"name": "Alice"})],
        polling_stations=[PollingStationCreate(station_id="ST-ATTACK", device_commitment="DEV-000")]
    )
    ElectionService.create_election(db, election_in)
    ElectionService.lock_election(db, e_id)

    # Ingest evidence
    ev = EvidenceService.create_evidence(
        db,
        EvidenceCreate(
            election_id=e_id,
            station_id="ST-ATTACK",
            evidence_type="station_summary",
            payload={"turnout": 100, "sealed": True}
        )
    )

    # Commit to Merkle Tree
    EvidenceService.commit_election_evidence(db, e_id)

    # Pre-tamper verification: must be VERIFIED
    verify_before = EvidenceService.verify_single_evidence(db, ev.evidence_id)
    assert verify_before["status"] == "VERIFIED"
    assert verify_before["hash_matches"] is True
    assert verify_before["signature_valid"] is True

    # Attack: Tamper turnout in database from 100 to 99999
    tamper_res = AttackService.simulate_database_tampering(db, ev.evidence_id, "turnout", 99999)
    assert tamper_res["status"] == "TAMPERING_DETECTED"
    assert tamper_res["hash_mismatch"] is True
    assert tamper_res["merkle_proof_valid"] is False

    # Post-tamper verification: must report TAMPERED
    verify_after = EvidenceService.verify_single_evidence(db, ev.evidence_id)
    assert verify_after["status"] == "TAMPERED"
    assert verify_after["hash_matches"] is False

    # Master public verification must report TAMPERED
    public_rep = VerificationService.full_public_verification(db, e_id, ev.evidence_id)
    assert public_rep["overall_verification_status"] == "TAMPERED"
    print("\nAttack 1: Database tampering instantly detected by SHA3 and ML-DSA integrity checks!")

def test_attack_forged_evidence_rejection(db):
    forge_res = AttackService.simulate_forged_evidence(db, "ELEC-DEMO", "ROGUE-NODE")
    assert forge_res["status"] == "REJECTED"
    assert forge_res["is_valid"] is False
    assert "SIGNATURE INVALID" in forge_res["reason"]
    print("\nAttack 2: Counterfeit evidence with forged signature rejected by cryptographic gateway!")
