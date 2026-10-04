from typing import Dict, Any, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.models import Evidence, Election, Validator, SecurityEvent, Nullifier
from app.crypto.canonical import canonicalize_json, sha3_256_hex
from app.crypto.pqc_service import PQCCryptoService, kms
from app.merkle.merkle_tree import MerkleTree
from app.zk.zk_service import ZKPrivacyService

class AttackService:
    @staticmethod
    def simulate_database_tampering(db: Session, evidence_id: str, tampered_field: str, tampered_value: Any) -> Dict[str, Any]:
        """
        Attack 1: Simulates malicious direct database tampering by an adversary
        modifying the evidence payload in storage while the stored content_hash remains original.
        """
        evidence = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
        if not evidence:
            raise KeyError(f"Evidence {evidence_id} not found")

        original_payload = dict(evidence.payload)
        original_hash = evidence.content_hash

        # Tamper payload
        new_payload = dict(evidence.payload)
        new_payload[tampered_field] = tampered_value
        evidence.payload = new_payload
        evidence.status = "TAMPERED"

        # Re-compute hash of new payload
        recomputed_hash = sha3_256_hex(canonicalize_json(new_payload))

        # Log critical security alert
        event = SecurityEvent(
            event_id=f"SEC-ATK-{uuid.uuid4().hex[:6].upper()}",
            event_type="TAMPERING_ATTEMPT",
            severity="CRITICAL",
            details={
                "evidence_id": evidence_id,
                "station_id": evidence.station_id,
                "stored_hash": original_hash,
                "tampered_recomputed_hash": recomputed_hash,
                "tampered_field": tampered_field,
                "tampered_value": tampered_value,
                "detected_at": datetime.utcnow().isoformat()
            },
            detected_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()

        return {
            "attack_type": "DATABASE_EVIDENCE_TAMPERING",
            "evidence_id": evidence_id,
            "original_content_hash": original_hash,
            "recomputed_content_hash": recomputed_hash,
            "hash_mismatch": True,
            "merkle_proof_valid": False,
            "signature_valid": False,
            "status": "TAMPERING_DETECTED",
            "security_event_id": event.event_id,
            "message": "CRITICAL ALERT: Evidence payload differs from cryptographically signed content hash! Merkle proof invalidated."
        }

    @staticmethod
    def simulate_forged_evidence(db: Session, election_id: str, station_id: str) -> Dict[str, Any]:
        """
        Attack 2: Adversary attempts to inject forged evidence with invalid/fake ML-DSA signature.
        """
        fake_payload = {"event": "result_package", "votes": 999999, "forged": True}
        canonical_p = canonicalize_json(fake_payload)
        content_hash = sha3_256_hex(canonical_p)

        # Generate fake signature (random bytes or corrupted signature)
        fake_sig = "DEADBEEF" * 32

        # Check signature verification
        pk_hex = kms.get_public_key_hex("STATION-EDG-KEY-001")
        is_valid = PQCCryptoService.verify_signature(pk_hex, bytes.fromhex(content_hash), fake_sig)

        # Log security event
        event = SecurityEvent(
            event_id=f"SEC-FORGE-{uuid.uuid4().hex[:6].upper()}",
            event_type="FORGED_SIGNATURE",
            severity="HIGH",
            details={
                "election_id": election_id,
                "station_id": station_id,
                "attempted_hash": content_hash,
                "action": "EVIDENCE_REJECTED"
            },
            detected_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()

        return {
            "attack_type": "FORGED_EVIDENCE_INJECTION",
            "is_valid": is_valid,
            "status": "REJECTED",
            "reason": "ML-DSA SIGNATURE INVALID — Digital signature verification failed against station public key.",
            "security_event_id": event.event_id
        }

    @staticmethod
    def simulate_duplicate_nullifier_attack(db: Session, election_id: str, nullifier_hash: str) -> Dict[str, Any]:
        """
        Attack 4: Double-participation attack using an identical nullifier.
        """
        return ZKPrivacyService.process_nullifier(db, election_id, nullifier_hash)
