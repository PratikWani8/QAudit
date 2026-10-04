from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Election, Candidate, PollingStation, SecurityEvent
from app.schemas.schemas import ElectionCreate
from app.crypto.canonical import canonicalize_json, sha3_256_hex
from app.crypto.pqc_service import PQCCryptoService, kms

class ElectionService:
    @staticmethod
    def create_election(db: Session, election_in: ElectionCreate) -> Election:
        existing = db.query(Election).filter(Election.election_id == election_in.election_id).first()
        if existing:
            raise ValueError(f"Election ID {election_in.election_id} already exists")

        election = Election(
            election_id=election_in.election_id,
            name=election_in.name,
            jurisdiction=election_in.jurisdiction,
            start_time=election_in.start_time,
            end_time=election_in.end_time,
            status="DRAFT"
        )
        db.add(election)
        db.flush()

        # Add candidates
        for c in election_in.candidates:
            c_hash = sha3_256_hex(canonicalize_json(c.public_metadata))
            cand = Candidate(
                candidate_id=c.candidate_id,
                election_id=election.election_id,
                candidate_hash=c_hash,
                public_metadata=c.public_metadata
            )
            db.add(cand)

        # Add polling stations
        for s in election_in.polling_stations:
            j_hash = sha3_256_hex(s.jurisdiction_hash or election_in.jurisdiction)
            station = PollingStation(
                station_id=s.station_id,
                election_id=election.election_id,
                jurisdiction_hash=j_hash,
                device_commitment=s.device_commitment,
                status="ACTIVE"
            )
            db.add(station)

        db.commit()
        db.refresh(election)
        return election

    @staticmethod
    def lock_election(db: Session, election_id: str, signing_key_id: str = "ELECTION-AUTHORITY-KEY-01") -> Dict[str, Any]:
        """
        Executes the cryptographic locking ceremony:
        1. Canonicalize election config (id, name, jurisdiction, candidates, stations)
        2. Generate SHA-3 hash
        3. Sign with ML-DSA (Post-Quantum)
        4. Commit and update status to LOCKED
        """
        election = db.query(Election).filter(Election.election_id == election_id).first()
        if not election:
            raise KeyError(f"Election {election_id} not found")
        if election.status != "DRAFT":
            raise ValueError(f"Election {election_id} cannot be locked: current status is {election.status}")

        candidates_data = [
            {
                "candidate_id": c.candidate_id,
                "candidate_hash": c.candidate_hash,
                "metadata": c.public_metadata
            }
            for c in sorted(election.candidates, key=lambda x: x.candidate_id)
        ]

        stations_data = [
            {
                "station_id": s.station_id,
                "device_commitment": s.device_commitment,
                "jurisdiction_hash": s.jurisdiction_hash
            }
            for s in sorted(election.polling_stations, key=lambda x: x.station_id)
        ]

        config_payload = {
            "election_id": election.election_id,
            "name": election.name,
            "jurisdiction": election.jurisdiction,
            "start_time": election.start_time.isoformat(),
            "end_time": election.end_time.isoformat(),
            "candidates": candidates_data,
            "polling_stations": stations_data,
            "lock_timestamp": datetime.utcnow().isoformat()
        }

        # 1. Canonicalize
        canonical_str = canonicalize_json(config_payload)
        
        # 2. SHA-3 Hash
        config_hash = sha3_256_hex(canonical_str)
        
        # 3. Post-Quantum ML-DSA Signature
        sig_hex = PQCCryptoService.sign_message(
            message_bytes=bytes.fromhex(config_hash),
            key_id=signing_key_id
        )

        # 4. Save and lock
        election.configuration_hash = config_hash
        election.signature = sig_hex
        election.signing_key_id = signing_key_id
        election.status = "LOCKED"
        
        db.commit()
        db.refresh(election)

        return {
            "election_id": election.election_id,
            "status": election.status,
            "canonical_json": canonical_str,
            "configuration_hash": config_hash,
            "signature": sig_hex,
            "signing_key_id": signing_key_id,
            "algorithm": "SHA3-256 + ML-DSA-44 (Dilithium2 / FIPS 204)"
        }

    @staticmethod
    def verify_election_config(db: Session, election_id: str) -> Dict[str, Any]:
        """
        Verify the ML-DSA signature and configuration hash of a locked election.
        """
        election = db.query(Election).filter(Election.election_id == election_id).first()
        if not election:
            raise KeyError(f"Election {election_id} not found")
        if not election.configuration_hash or not election.signature:
            return {
                "election_id": election_id,
                "is_valid": False,
                "reason": "Election configuration is not locked or has missing cryptographic signature"
            }

        pk_hex = kms.get_public_key_hex(election.signing_key_id)
        if not pk_hex:
            return {
                "election_id": election_id,
                "is_valid": False,
                "reason": f"Public key for {election.signing_key_id} not found"
            }

        # Verify signature over hash
        msg_bytes = bytes.fromhex(election.configuration_hash)
        is_sig_valid = PQCCryptoService.verify_signature(
            public_key_hex=pk_hex,
            message_bytes=msg_bytes,
            signature_hex=election.signature
        )

        return {
            "election_id": election_id,
            "name": election.name,
            "jurisdiction": election.jurisdiction,
            "status": election.status,
            "configuration_hash": election.configuration_hash,
            "signature": election.signature,
            "signing_key_id": election.signing_key_id,
            "public_key": pk_hex,
            "algorithm": "ML-DSA-44 (NIST FIPS 204)",
            "is_signature_valid": is_sig_valid
        }
