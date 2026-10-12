import pytest
from datetime import datetime, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.models import Election
from app.schemas.schemas import ElectionCreate, EvidenceCreate, CandidateCreate, PollingStationCreate
from app.services.election_service import ElectionService
from app.services.evidence_service import EvidenceService
from app.merkle.merkle_tree import MerkleTree

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_merkle_tree_math_and_proofs():
    leaves = [f"leaf_hash_{i}_{'a'*60}" for i in range(8)]
    tree = MerkleTree(leaves)
    root = tree.get_root()
    assert len(root) == 64

    # Verify proof for each leaf
    for leaf in leaves:
        proof = tree.get_proof(leaf)
        assert proof is not None
        assert MerkleTree.verify_proof(leaf, proof, root) is True
        
        # Tampered leaf should fail
        assert MerkleTree.verify_proof(leaf + "bad", proof, root) is False

def test_evidence_ingestion_and_commitment(db):
    e_id = f"TEST-MERKLE-{int(datetime.utcnow().timestamp())}"
    election_in = ElectionCreate(
        election_id=e_id,
        name="Merkle Evidence Test Election",
        jurisdiction="District 9",
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(days=1),
        candidates=[CandidateCreate(candidate_id="C1", public_metadata={"name": "Alice"})],
        polling_stations=[PollingStationCreate(station_id="ST-101", device_commitment="DEV-101")]
    )
    ElectionService.create_election(db, election_in)
    ElectionService.lock_election(db, e_id)

    # Ingest 4 distinct simulated election evidence records
    ev_types = ["poll_opened", "device_commitment", "station_summary", "poll_closed"]
    ev_ids = []
    for ev_type in ev_types:
        ev = EvidenceService.create_evidence(
            db,
            EvidenceCreate(
                election_id=e_id,
                station_id="ST-101",
                evidence_type=ev_type,
                payload={"event": ev_type, "station": "ST-101", "voter_turnout": 42}
            )
        )
        assert ev.content_hash is not None
        assert ev.signature is not None
        ev_ids.append(ev.evidence_id)

    # Commit evidence into Merkle Tree
    commit = EvidenceService.commit_election_evidence(db, e_id)
    assert commit.merkle_root is not None
    assert len(commit.merkle_root) == 64

    # Test Merkle proof for each evidence record
    for ev_id in ev_ids:
        proof_res = EvidenceService.get_evidence_proof(db, ev_id)
        assert proof_res["is_valid"] is True
        assert proof_res["merkle_root"] == commit.merkle_root

    print("\nPhase 3 Merkle Tree and Evidence Engine tests passed successfully!")
