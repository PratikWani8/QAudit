from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.models import Evidence, Election, CryptographicCommitment, SecurityEvent
from app.schemas.schemas import EvidenceCreate
from app.crypto.canonical import canonicalize_json, sha3_256_hex
from app.crypto.pqc_service import PQCCryptoService, kms
from app.merkle.merkle_tree import MerkleTree

class EvidenceService:
    @staticmethod
    def create_evidence(
        db: Session,
        evidence_in: EvidenceCreate,
        signing_key_id: str = "STATION-EDG-KEY-001"
    ) -> Evidence:
        """
        Ingests a new piece of election evidence:
        RAW EVIDENCE -> CANONICAL JSON -> SHA-3 HASH -> ML-DSA SIGNATURE -> STORAGE
        """
        # Ensure election exists
        election = db.query(Election).filter(Election.election_id == evidence_in.election_id).first()
        if not election:
            raise KeyError(f"Election {evidence_in.election_id} not found")

        # 1. Canonicalize payload
        canonical_payload = canonicalize_json(evidence_in.payload)
        
        # 2. SHA-3 Hashing
        content_hash = sha3_256_hex(canonical_payload)

        # 3. ML-DSA Digital Signature (Post-Quantum)
        # If signature was provided by edge device, verify it; otherwise sign with station key
        key_id = evidence_in.signing_key_id or signing_key_id
        if evidence_in.signature:
            sig_hex = evidence_in.signature
            pk_hex = kms.get_public_key_hex(key_id)
            if pk_hex:
                is_valid = PQCCryptoService.verify_signature(pk_hex, bytes.fromhex(content_hash), sig_hex)
                if not is_valid:
                    raise ValueError("Supplied ML-DSA signature failed verification against station key")
        else:
            sig_hex = PQCCryptoService.sign_message(
                message_bytes=bytes.fromhex(content_hash),
                key_id=key_id
            )

        evidence_id = f"EVD-{evidence_in.station_id}-{uuid.uuid4().hex[:8].upper()}"

        evidence = Evidence(
            evidence_id=evidence_id,
            election_id=evidence_in.election_id,
            station_id=evidence_in.station_id,
            evidence_type=evidence_in.evidence_type,
            content_hash=content_hash,
            storage_reference=f"ipfs://bafy-qaudit-{content_hash[:16]}",
            timestamp=evidence_in.timestamp or datetime.utcnow(),
            signature=sig_hex,
            signing_key_id=key_id,
            status="VERIFIED",
            payload=evidence_in.payload
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def commit_election_evidence(
        db: Session,
        election_id: str,
        signing_key_id: str = "ELECTION-AUTHORITY-KEY-01"
    ) -> CryptographicCommitment:
        """
        Constructs a Merkle Tree across all evidence records for the election,
        computes the Merkle Root, signs it with ML-DSA, and creates a CryptographicCommitment.
        """
        election = db.query(Election).filter(Election.election_id == election_id).first()
        if not election:
            raise KeyError(f"Election {election_id} not found")

        records = db.query(Evidence).filter(Evidence.election_id == election_id).order_by(Evidence.id.asc()).all()
        if not records:
            raise ValueError(f"No evidence records available to commit for election {election_id}")

        leaf_hashes = [r.content_hash for r in records]
        merkle_tree = MerkleTree(leaf_hashes)
        merkle_root = merkle_tree.get_root()

        # Previous commitment root if any
        prev_commit = db.query(CryptographicCommitment).filter(
            CryptographicCommitment.election_id == election_id
        ).order_by(CryptographicCommitment.id.desc()).first()
        prev_root = prev_commit.merkle_root if prev_commit else "0" * 64

        # Sign the Merkle root with ML-DSA
        root_sig = PQCCryptoService.sign_message(
            message_bytes=bytes.fromhex(merkle_root),
            key_id=signing_key_id
        )

        commitment_id = f"COMMIT-{election_id}-{uuid.uuid4().hex[:8].upper()}"
        commitment = CryptographicCommitment(
            commitment_id=commitment_id,
            election_id=election_id,
            evidence_hash=sha3_256_hex("".join(leaf_hashes)),
            merkle_root=merkle_root,
            previous_root=prev_root,
            algorithm="SHA3-256 + ML-DSA-44",
            signature=root_sig,
            timestamp=datetime.utcnow(),
            status="COMMITTED"
        )
        db.add(commitment)
        db.commit()
        db.refresh(commitment)
        return commitment

    @staticmethod
    def get_evidence_proof(db: Session, evidence_id: str) -> Dict[str, Any]:
        """
        Generates independent Merkle Proof for an individual evidence record.
        """
        evidence = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
        if not evidence:
            raise KeyError(f"Evidence {evidence_id} not found")

        # Get all evidence in this election to reconstruct the tree
        records = db.query(Evidence).filter(Evidence.election_id == evidence.election_id).order_by(Evidence.id.asc()).all()
        leaf_hashes = [r.content_hash for r in records]
        
        merkle_tree = MerkleTree(leaf_hashes)
        root = merkle_tree.get_root()
        proof_path = merkle_tree.get_proof(evidence.content_hash)
        
        if proof_path is None:
            raise ValueError(f"Evidence hash {evidence.content_hash} not found in Merkle leaves")

        # Verify locally before returning
        is_valid = MerkleTree.verify_proof(evidence.content_hash, proof_path, root)

        return {
            "evidence_id": evidence.evidence_id,
            "leaf_hash": evidence.content_hash,
            "merkle_root": root,
            "proof_path": proof_path,
            "is_valid": is_valid,
            "tree_size": len(leaf_hashes)
        }

    @staticmethod
    def verify_single_evidence(db: Session, evidence_id: str) -> Dict[str, Any]:
        """
        Cryptographically verifies:
        1. Canonical JSON content re-hashing matches content_hash
        2. ML-DSA signature over content_hash is valid
        """
        evidence = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
        if not evidence:
            raise KeyError(f"Evidence {evidence_id} not found")

        # Re-compute hash from current payload in DB
        recomputed_hash = sha3_256_hex(canonicalize_json(evidence.payload))
        hash_matches = (recomputed_hash.lower() == evidence.content_hash.lower())

        # Verify ML-DSA signature
        pk_hex = kms.get_public_key_hex(evidence.signing_key_id)
        sig_valid = False
        if pk_hex:
            sig_valid = PQCCryptoService.verify_signature(
                public_key_hex=pk_hex,
                message_bytes=bytes.fromhex(evidence.content_hash),
                signature_hex=evidence.signature
            )

        status_result = "VERIFIED" if (hash_matches and sig_valid) else "TAMPERED"

        return {
            "evidence_id": evidence.evidence_id,
            "station_id": evidence.station_id,
            "evidence_type": evidence.evidence_type,
            "stored_content_hash": evidence.content_hash,
            "recomputed_content_hash": recomputed_hash,
            "hash_matches": hash_matches,
            "signing_key_id": evidence.signing_key_id,
            "signature_valid": sig_valid,
            "algorithm": "ML-DSA-44",
            "status": status_result
        }
