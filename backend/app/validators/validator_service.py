from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.models import Validator, ValidatorAttestation, CryptographicCommitment, SecurityEvent
from app.schemas.schemas import AttestationCreate, BFTAgreementStatus, AttestationResponse
from app.crypto.pqc_service import PQCCryptoService, kms
from app.core.config import settings

# Default 5 federated validator specifications
DEFAULT_VALIDATORS = [
    {
        "validator_id": "VAL-GOV-01",
        "organization_name": "National Election Authority",
        "organization_type": "GOVERNMENT",
        "key_id": "VALIDATOR-KEY-01"
    },
    {
        "validator_id": "VAL-AUD-02",
        "organization_name": "Independent Electoral Audit Commission",
        "organization_type": "AUDITOR",
        "key_id": "VALIDATOR-KEY-02"
    },
    {
        "validator_id": "VAL-ACAD-03",
        "organization_name": "Quantum Security Research Institute",
        "organization_type": "ACADEMIC",
        "key_id": "VALIDATOR-KEY-03"
    },
    {
        "validator_id": "VAL-OBS-04",
        "organization_name": "International Transparency Watch",
        "organization_type": "OBSERVER",
        "key_id": "VALIDATOR-KEY-04"
    },
    {
        "validator_id": "VAL-SEC-05",
        "organization_name": "National Cyber Defense Command",
        "organization_type": "SECURITY",
        "key_id": "VALIDATOR-KEY-05"
    }
]

class ValidatorService:
    @staticmethod
    def ensure_default_validators(db: Session):
        """Pre-registers the 5 federated validator nodes with real ML-DSA keys in DB."""
        for v_meta in DEFAULT_VALIDATORS:
            v_id = v_meta["validator_id"]
            existing = db.query(Validator).filter(Validator.validator_id == v_id).first()
            pk_hex = kms.get_public_key_hex(v_meta["key_id"])
            if not existing:
                validator = Validator(
                    validator_id=v_id,
                    organization_name=v_meta["organization_name"],
                    organization_type=v_meta["organization_type"],
                    public_key=pk_hex or "PENDING",
                    status="ONLINE",
                    last_seen=datetime.utcnow()
                )
                db.add(validator)
            else:
                existing.public_key = pk_hex
                existing.last_seen = datetime.utcnow()
        db.commit()

    @staticmethod
    def submit_attestation(
        db: Session,
        validator_id: str,
        commitment_id: str,
        decision: str = "ACCEPT",
        signature: Optional[str] = None
    ) -> ValidatorAttestation:
        """
        Validates commitment and registers a signed attestation from a validator node.
        """
        validator = db.query(Validator).filter(Validator.validator_id == validator_id).first()
        if not validator:
            raise KeyError(f"Validator {validator_id} not registered")

        if validator.status != "ONLINE":
            raise ValueError(f"Validator {validator_id} is currently {validator.status} and cannot submit attestations")

        commitment = db.query(CryptographicCommitment).filter(
            CryptographicCommitment.commitment_id == commitment_id
        ).first()
        if not commitment:
            raise KeyError(f"Commitment {commitment_id} not found")

        # Check for existing attestation
        existing = db.query(ValidatorAttestation).filter(
            ValidatorAttestation.commitment_id == commitment_id,
            ValidatorAttestation.validator_id == validator_id
        ).first()
        if existing:
            return existing

        # Sign the Merkle root with validator's ML-DSA key
        key_id = f"VALIDATOR-KEY-0{validator_id[-1]}" if validator_id[-1].isdigit() else "VALIDATOR-KEY-01"
        if signature:
            # External signature verification
            is_valid = PQCCryptoService.verify_signature(
                validator.public_key,
                bytes.fromhex(commitment.merkle_root),
                signature
            )
            if not is_valid:
                raise ValueError("Supplied attestation signature is cryptographically invalid")
            sig_hex = signature
        else:
            sig_hex = PQCCryptoService.sign_message(
                message_bytes=bytes.fromhex(commitment.merkle_root),
                key_id=key_id
            )

        attestation = ValidatorAttestation(
            attestation_id=f"ATT-{validator_id}-{uuid.uuid4().hex[:6].upper()}",
            commitment_id=commitment_id,
            validator_id=validator_id,
            signature=sig_hex,
            decision=decision,
            timestamp=datetime.utcnow()
        )
        db.add(attestation)
        
        validator.last_seen = datetime.utcnow()
        db.commit()
        db.refresh(attestation)

        # Check if BFT threshold is now achieved
        ValidatorService.check_bft_agreement(db, commitment_id)
        return attestation

    @staticmethod
    def check_bft_agreement(db: Session, commitment_id: str) -> BFTAgreementStatus:
        """
        Calculates BFT agreement state:
        N = total online/registered validators
        Threshold = settings.BFT_THRESHOLD (e.g. 4 of 5 for Byzantine agreement)
        """
        commitment = db.query(CryptographicCommitment).filter(
            CryptographicCommitment.commitment_id == commitment_id
        ).first()
        if not commitment:
            raise KeyError(f"Commitment {commitment_id} not found")

        total_validators = db.query(Validator).count() or 5
        attestations = db.query(ValidatorAttestation).filter(
            ValidatorAttestation.commitment_id == commitment_id
        ).all()

        accept_count = sum(1 for a in attestations if a.decision == "ACCEPT")
        reject_count = sum(1 for a in attestations if a.decision == "REJECT")
        
        # Supermajority threshold (e.g. >= 4 out of 5, or > 66%)
        threshold_met = accept_count >= settings.BFT_THRESHOLD
        quorum_reached = len(attestations) >= settings.BFT_THRESHOLD

        if threshold_met:
            status = "FINALIZED"
            commitment.status = "FINALIZED"
            db.commit()
        elif reject_count >= 2:
            status = "FAILED"
            commitment.status = "REJECTED"
            db.commit()
        else:
            status = "IN_PROGRESS"

        att_responses = []
        for a in attestations:
            val = db.query(Validator).filter(Validator.validator_id == a.validator_id).first()
            att_responses.append(AttestationResponse(
                id=a.id,
                attestation_id=a.attestation_id,
                commitment_id=a.commitment_id,
                validator_id=a.validator_id,
                organization_name=val.organization_name if val else a.validator_id,
                signature=a.signature,
                decision=a.decision,
                timestamp=a.timestamp
            ))

        return BFTAgreementStatus(
            commitment_id=commitment_id,
            merkle_root=commitment.merkle_root,
            total_validators=total_validators,
            attestations_count=len(attestations),
            accept_count=accept_count,
            reject_count=reject_count,
            quorum_reached=quorum_reached,
            threshold_met=threshold_met,
            status=status,
            attestations=att_responses
        )

    @staticmethod
    def simulate_validator_failure(db: Session, validator_id: str, new_status: str) -> Validator:
        """
        Simulate taking a validator OFFLINE or BYZANTINE for Attack Lab demo!
        """
        valid_statuses = ["ONLINE", "OFFLINE", "BYZANTINE"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status {new_status}. Must be one of {valid_statuses}")

        val = db.query(Validator).filter(Validator.validator_id == validator_id).first()
        if not val:
            raise KeyError(f"Validator {validator_id} not found")

        val.status = new_status
        db.commit()
        db.refresh(val)

        # Log security event
        event = SecurityEvent(
            event_id=f"SEC-VAL-{uuid.uuid4().hex[:6].upper()}",
            event_type="VALIDATOR_OFFLINE" if new_status == "OFFLINE" else "VALIDATOR_BYZANTINE",
            severity="MEDIUM" if new_status == "OFFLINE" else "HIGH",
            details={
                "validator_id": validator_id,
                "organization": val.organization_name,
                "new_status": new_status,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        db.add(event)
        db.commit()

        return val
