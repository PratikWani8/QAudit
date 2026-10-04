from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Election, Evidence, CryptographicCommitment, AuditRun
from app.services.election_service import ElectionService
from app.services.evidence_service import EvidenceService
from app.validators.validator_service import ValidatorService
from app.merkle.merkle_tree import MerkleTree

class VerificationService:
    @staticmethod
    def full_public_verification(
        db: Session,
        election_id: str,
        evidence_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive public verification pipeline:
        1. Election configuration integrity & ML-DSA signature
        2. Evidence record hash & station signature
        3. Merkle tree inclusion proof
        4. Validator network BFT consensus status
        5. QRNG audit status
        """
        election = db.query(Election).filter(Election.election_id == election_id).first()
        if not election:
            raise KeyError(f"Election {election_id} not found")

        # 1. Config verification
        config_res = ElectionService.verify_election_config(db, election_id)
        config_valid = config_res.get("is_signature_valid", False)

        # 2. Latest commitment & BFT status
        latest_commit = db.query(CryptographicCommitment).filter(
            CryptographicCommitment.election_id == election_id
        ).order_by(CryptographicCommitment.id.desc()).first()

        bft_status = None
        merkle_root = None
        if latest_commit:
            merkle_root = latest_commit.merkle_root
            bft_status = ValidatorService.check_bft_agreement(db, latest_commit.commitment_id)

        # 3. Evidence verification & Merkle proof (if evidence_id provided or pick first)
        ev_id = evidence_id
        if not ev_id:
            first_ev = db.query(Evidence).filter(Evidence.election_id == election_id).first()
            if first_ev:
                ev_id = first_ev.evidence_id

        evidence_valid = False
        merkle_proof_valid = False
        evidence_info = None
        merkle_proof_info = None

        if ev_id:
            ev_check = EvidenceService.verify_single_evidence(db, ev_id)
            evidence_valid = (ev_check.get("status") == "VERIFIED")
            evidence_info = ev_check

            try:
                proof_res = EvidenceService.get_evidence_proof(db, ev_id)
                merkle_proof_valid = proof_res.get("is_valid", False)
                merkle_proof_info = proof_res
            except Exception:
                merkle_proof_valid = False

        # 4. Audit Run status
        latest_audit = db.query(AuditRun).filter(
            AuditRun.election_id == election_id
        ).order_by(AuditRun.created_at.desc()).first()

        audit_status = latest_audit.status if latest_audit else "NOT_STARTED"

        # Overall Status
        all_passed = (
            config_valid and
            (evidence_valid if ev_id else True) and
            (merkle_proof_valid if ev_id else True) and
            (bft_status.threshold_met if bft_status else False)
        )

        overall = "VERIFIED" if all_passed else ("TAMPERED" if (evidence_info and evidence_info.get("status") == "TAMPERED") else "PENDING_CONSENSUS")

        return {
            "election_id": election.election_id,
            "election_name": election.name,
            "jurisdiction": election.jurisdiction,
            "election_status": election.status,
            "configuration_hash": election.configuration_hash or "NOT_LOCKED",
            "config_signature_valid": config_valid,
            "evidence_id": ev_id,
            "evidence_info": evidence_info,
            "evidence_signature_valid": evidence_valid,
            "merkle_root": merkle_root,
            "merkle_proof_valid": merkle_proof_valid,
            "merkle_proof_info": merkle_proof_info,
            "bft_agreement": bft_status,
            "audit_status": audit_status,
            "audit_run_id": latest_audit.audit_id if latest_audit else None,
            "entropy_commitment": latest_audit.entropy_commitment if latest_audit else None,
            "overall_verification_status": overall
        }
