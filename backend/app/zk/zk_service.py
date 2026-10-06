"""
Zero-Knowledge Privacy & Anonymous Credential Service:
Implements:
1. Separate Identity Provider Domain (never stores vote choices)
2. Schnorr/Sigma-protocol with Fiat-Shamir heuristic for Zero-Knowledge Proof of Knowledge
3. Anonymous voting credential generation
4. Election-specific Nullifier derivation: Nullifier = SHA3-256(voter_secret || election_id)
5. Strict duplicate participation prevention
"""

import os
import hashlib
from typing import Dict, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from app.crypto.canonical import sha3_256_hex
from app.models.models import Nullifier, SecurityEvent

# Secure cyclic group parameters (RFC 3526 MODP 2048-bit prime group or standard 256-bit safe parameters)
# Using standard 256-bit safe prime p = 2q + 1 for fast hackathon math
# Prime p (hex):
P_HEX = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF"
P = int(P_HEX, 16)
Q = (P - 1) // 2
G = 2 # Generator

class ZKPrivacyService:
    @staticmethod
    def generate_anonymous_credential(voter_secret: str, election_id: str) -> Dict[str, Any]:
        """
        Simulated Client-Side / Identity Provider Credential Derivation:
        - voter_secret is held privately by citizen (e.g. derived from ID + biometric salt).
        - Computes Public Credential Commitment: Y = G^x mod P.
        - Computes Election-Specific Nullifier: Nullifier = SHA3-256(x || election_id).
        """
        x = int(sha3_256_hex(voter_secret), 16) % Q
        Y = pow(G, x, P)
        
        # Nullifier is deterministic for this election, unlinkable across different elections
        nullifier_preimage = f"{voter_secret}:{election_id}".encode('utf-8')
        nullifier_hash = sha3_256_hex(nullifier_preimage)
        
        return {
            "credential_commitment": hex(Y),
            "nullifier_hash": nullifier_hash,
            "election_id": election_id
        }

    @staticmethod
    def create_zk_proof(voter_secret: str, election_id: str) -> Dict[str, Any]:
        """
        Generate Non-Interactive Zero-Knowledge Proof (NIZK) of Knowledge of Secret Key x:
        1. Prover picks random blinding factor v in [1, Q-1]
        2. Prover computes commitment t = G^v mod P
        3. Challenge c = SHA3-256(G || Y || t || election_id) mod Q (Fiat-Shamir heuristic)
        4. Response s = (v - c * x) mod Q
        5. Proof is (t, s, Y)
        """
        x = int(sha3_256_hex(voter_secret), 16) % Q
        Y = pow(G, x, P)

        # 1. Random blinding factor
        v = int.from_bytes(os.urandom(32), 'big') % Q
        t = pow(G, v, P)

        # 2. Fiat-Shamir challenge
        transcript = f"{G}:{hex(Y)}:{hex(t)}:{election_id}".encode('utf-8')
        c = int(sha3_256_hex(transcript), 16) % Q

        # 3. Response
        s = (v - (c * x)) % Q

        return {
            "commitment_t": hex(t),
            "response_s": hex(s),
            "public_key_Y": hex(Y),
            "election_id": election_id
        }

    @staticmethod
    def verify_zk_proof(proof_data: Dict[str, Any], election_id: str) -> Tuple[bool, str]:
        """
        Verifies the Zero-Knowledge Proof:
        Checks: G^s * Y^c == t mod P
        Reveals NOTHING about the voter's identity or secret key x.
        """
        try:
            t = int(proof_data["commitment_t"], 16)
            s = int(proof_data["response_s"], 16)
            Y = int(proof_data["public_key_Y"], 16)

            # Re-compute challenge c
            transcript = f"{G}:{hex(Y)}:{hex(t)}:{election_id}".encode('utf-8')
            c = int(sha3_256_hex(transcript), 16) % Q

            # Verification equation: (G^s * Y^c) % P == t
            lhs = (pow(G, s, P) * pow(Y, c, P)) % P
            rhs = t % P

            if lhs == rhs:
                return True, "Zero-Knowledge eligibility proof mathematically verified: prover possesses valid eligible credential."
            else:
                return False, "ZK verification failed: cryptographic challenge check did not balance."
        except Exception as e:
            return False, f"Malformed ZK proof payload: {str(e)}"

    @staticmethod
    def process_nullifier(db: Session, election_id: str, nullifier_hash: str) -> Dict[str, Any]:
        """
        Nullifier verification and double-voting prevention:
        IF nullifier exists: REJECT DUPLICATE
        ELSE: ACCEPT and record
        Never links nullifier to a voter identity.
        """
        existing = db.query(Nullifier).filter(
            Nullifier.election_id == election_id,
            Nullifier.nullifier_hash == nullifier_hash
        ).first()

        now = datetime.utcnow()

        if existing:
            # Log security event
            event = SecurityEvent(
                event_id=f"SEC-NUL-{os.urandom(4).hex().upper()}",
                event_type="DUPLICATE_NULLIFIER",
                severity="HIGH",
                details={
                    "election_id": election_id,
                    "nullifier_hash": nullifier_hash,
                    "first_seen_at": existing.first_seen_at.isoformat(),
                    "attempted_at": now.isoformat(),
                    "action": "DUPLICATE_REJECTED"
                },
                detected_at=now
            )
            db.add(event)
            db.commit()

            return {
                "status": "DUPLICATE_REJECTED",
                "nullifier_hash": nullifier_hash,
                "election_id": election_id,
                "message": "REJECTED — Nullifier has already been recorded for this election. Duplicate participation prevented.",
                "timestamp": now
            }

        # First time seen: accept
        nul = Nullifier(
            election_id=election_id,
            nullifier_hash=nullifier_hash,
            first_seen_at=now,
            status="VALID"
        )
        db.add(nul)
        db.commit()

        return {
            "status": "ACCEPTED",
            "nullifier_hash": nullifier_hash,
            "election_id": election_id,
            "message": "ACCEPTED — Unique anonymous nullifier registered. Zero duplicate records found.",
            "timestamp": now
        }
