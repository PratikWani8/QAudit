"""
Q-Audit Demo Data Seeder
Seeds a realistic simulated national demonstration election:
- 4 Candidates
- 10 Polling Stations
- Configuration Locked with ML-DSA Post-Quantum Signature
- Multiple simulated evidence packages (poll_opened, device_commitment, station_summary, poll_closed)
- Committed Merkle Tree Root
- Attestations by Federated Validators reaching BFT Consensus
- Deterministic QRNG-seeded Audit Run
"""

from datetime import datetime, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.models import User, Election, Candidate, PollingStation, Evidence, CryptographicCommitment, AuditRun, AuditSample, Nullifier
from app.schemas.schemas import ElectionCreate, CandidateCreate, PollingStationCreate, EvidenceCreate, AuditCreate
from app.services.election_service import ElectionService
from app.services.evidence_service import EvidenceService
from app.validators.validator_service import ValidatorService
from app.audits.audit_service import AuditService
from app.core.security import get_password_hash

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("[SEED] Ensuring default validators...")
        ValidatorService.ensure_default_validators(db)

        # Seed Users
        roles = [
            ("superadmin", "SUPER_ADMIN", "admin@qaudit.gov"),
            ("authority", "ELECTION_AUTHORITY", "authority@qaudit.gov"),
            ("validator1", "VALIDATOR", "validator1@qaudit.gov"),
            ("auditor", "AUDITOR", "auditor@qaudit.gov"),
            ("citizen", "CITIZEN", "citizen@qaudit.gov"),
        ]
        for uname, role, email in roles:
            if not db.query(User).filter(User.username == uname).first():
                user = User(
                    username=uname,
                    email=email,
                    hashed_password=get_password_hash("password123"),
                    role=role,
                    is_active=True
                )
                db.add(user)
        db.commit()

        # Seed Demo Election
        e_id = "DEMO-NATIONAL-2026"
        existing = db.query(Election).filter(Election.election_id == e_id).first()
        if existing:
            print(f"[SEED] Election {e_id} already exists. Skipping creation.")
            return

        print(f"[SEED] Creating demo election {e_id}...")
        now = datetime.utcnow()
        election_in = ElectionCreate(
            election_id=e_id,
            name="National Demonstration Election 2026 (Simulated)",
            jurisdiction="Federal Republic — National Audit Pilot",
            start_time=now - timedelta(hours=12),
            end_time=now + timedelta(hours=12),
            candidates=[
                CandidateCreate(candidate_id="CAN-001", public_metadata={"name": "Dr. Elena Vance", "party": "Quantum Progress Alliance", "ballot_index": 1}),
                CandidateCreate(candidate_id="CAN-002", public_metadata={"name": "Marcus Sterling", "party": "Constitutional Integrity Party", "ballot_index": 2}),
                CandidateCreate(candidate_id="CAN-003", public_metadata={"name": "Aria Chen", "party": "Digital Democracy Coalition", "ballot_index": 3}),
                CandidateCreate(candidate_id="CAN-004", public_metadata={"name": "Samuel Thorne", "party": "Independent Reformist", "ballot_index": 4})
            ],
            polling_stations=[
                PollingStationCreate(station_id=f"STATION-{i:03d}", device_commitment=f"EVM-HSM-COMMIT-{i:04d}-FIPS204")
                for i in range(1, 11)
            ]
        )
        election = ElectionService.create_election(db, election_in)
        print("[SEED] Locking election with ML-DSA post-quantum signature...")
        ElectionService.lock_election(db, e_id)

        print("[SEED] Ingesting simulated evidence packages across polling stations...")
        evidence_types = [
            ("poll_opened", {"event": "poll_opened", "officer_id": "OFF-882", "tamper_tape_verified": True}),
            ("device_commitment", {"event": "device_commitment", "firmware_sha3": "9a8b7c6d5e4f3a2b1c0d", "battery_status": "OK"}),
            ("station_summary", {"event": "station_summary", "registered_voters": 1200, "voter_turnout": 842, "provisional_ballots": 4}),
            ("poll_closed", {"event": "poll_closed", "seal_number": "SL-99281-QC", "audit_tape_generated": True})
        ]

        for s_idx in range(1, 11):
            s_id = f"STATION-{s_idx:03d}"
            for ev_type, payload_base in evidence_types:
                p = dict(payload_base)
                p["station_id"] = s_id
                EvidenceService.create_evidence(
                    db,
                    EvidenceCreate(
                        election_id=e_id,
                        station_id=s_id,
                        evidence_type=ev_type,
                        payload=p
                    )
                )

        print("[SEED] Constructing Merkle Tree and committing root...")
        commitment = EvidenceService.commit_election_evidence(db, e_id)

        print("[SEED] Gathering Federated Validator attestations (BFT consensus)...")
        validators = ["VAL-GOV-01", "VAL-AUD-02", "VAL-ACAD-03", "VAL-OBS-04"]
        for v_id in validators:
            ValidatorService.submit_attestation(db, v_id, commitment.commitment_id, "ACCEPT")

        print("[SEED] Executing QRNG-seeded deterministic audit run...")
        AuditService.run_audit(
            db,
            AuditCreate(
                election_id=e_id,
                algorithm_version="Q-AUDIT-v1.0-NIST-PQC",
                sample_size=4,
                force_fallback=True
            )
        )

        # Seed sample nullifiers
        sample_nullifiers = [
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            "1c0c6e8e04b4c6e91122a613271701385f09623e1f0e4088a2a5e5ffc9c9c811"
        ]
        for nh in sample_nullifiers:
            nul = Nullifier(election_id=e_id, nullifier_hash=nh, first_seen_at=now, status="VALID")
            db.add(nul)
        db.commit()

        print("[SEED] Successfully seeded complete realistic Q-Audit demonstration data!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
