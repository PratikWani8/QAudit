import os
import hashlib
import httpx
from typing import Tuple, Dict, Any
from app.crypto.canonical import sha3_256_hex
from app.core.config import settings

class QRNGService:
    """
    Quantum Random Number Generation (QRNG) Service:
    Provides election-level/audit-level quantum entropy.
    Interfaces with ANU Quantum Random Numbers API (Australian National University
    quantum optics lab measuring vacuum fluctuations in electromagnetic fields).
    Includes a clearly labeled fallback simulator for local/offline execution.
    """

    @staticmethod
    def get_entropy(force_fallback: bool = False) -> Tuple[str, bool, str]:
        """
        Retrieves 256 bits (32 bytes = 64 hex characters) of quantum entropy.
        Returns: (entropy_hex, is_genuine_quantum, source_description)
        """
        if not force_fallback:
            try:
                # Attempt ANU Quantum API with short timeout
                resp = httpx.get(
                    settings.QRNG_API_URL,
                    timeout=3.0,
                    headers={"User-Agent": "Q-Audit-Quantum-Election-Verifier/1.0"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    # ANU returns { "type": "hex16", "length": 32, "data": ["0a1b..."], "success": true }
                    if data.get("success") and "data" in data and len(data["data"]) > 0:
                        entropy_hex = "".join(data["data"])[:64]
                        if len(entropy_hex) == 64:
                            return (
                                entropy_hex,
                                True,
                                "ANU Quantum Optics Lab (Real Quantum Vacuum Fluctuations API)"
                            )
            except Exception as e:
                # Graceful fallback to simulator
                pass

        # Clearly labeled simulation fallback
        # Generates entropy using OS cryptographically secure random source + SHA3-256 state mix
        raw_os_bytes = os.urandom(32)
        simulated_entropy = sha3_256_hex(b"DEMO_QRNG_OPTICAL_VACUUM_SIMULATOR_" + raw_os_bytes)
        return (
            simulated_entropy,
            False,
            "DEMO SIMULATION: Cryptographically Secure Pseudo-Quantum Fallback (Not True Quantum Optical Hardware)"
        )

    @staticmethod
    def get_entropy_commitment(entropy_hex: str) -> str:
        """
        Computes SHA3-256 commitment of the entropy before public revelation:
        Commitment = SHA3-256(entropy_hex)
        """
        return sha3_256_hex(entropy_hex.encode('utf-8'))
