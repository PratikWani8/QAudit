# Threat Model & Security Boundaries

## 1. Adversary Assumptions & Capabilities

Q-Audit models an advanced adversary with:
1. **Direct Database Access:** An insider or compromised DB administrator attempting to silently modify ballot tallies or station turnout counts.
2. **Network Eavesdropping / Man-in-the-Middle:** Adversary injecting synthetic, forged election evidence packages onto the network.
3. **Byzantine Validator Collusion:** Up to $f < N/3$ validator nodes compromised, offline, or providing contradictory attestations.
4. **Quantum Adversary (Shor's Algorithm):** An adversary with access to cryptographically relevant quantum computers (CRQCs) capable of factoring RSA or computing discrete logarithms on standard elliptic curves (ECC).

---

## 2. Cryptographic Defenses

| Attack Vector | Defense Mechanism | Cryptographic Primitive | Detection Result |
| :--- | :--- | :--- | :--- |
| **Direct Database Tampering** | Content Hash & Merkle Path Invalidation | SHA3-256 (FIPS 202) | Instant Content Hash Mismatch & Merkle Root Invalidation |
| **Forged Evidence Injection** | Digital Signature Authentication | ML-DSA-44 (NIST FIPS 204) | Cryptographic Verification Failure; Ingestion Rejected |
| **Quantum Decryption / Forgery** | Lattice-based Hardness (Module-LWE / SIS) | Dilithium2 & Kyber512 | Quantum-Resilient Security |
| **Auditor Seed Manipulation** | Quantum Entropy Commit-Reveal | ANU QRNG + SHA3-256 | Deterministic, Verifiable Sample Reproducibility |
| **Double-Voting / Replay Attack** | Unique Nullifier Registration | SHA3-256(Secret \|\| ElectionID) | Instant Rejection: "DUPLICATE_REJECTED" |

---

## 3. Explicit Non-Guarantees (Boundary of Cryptography)

1. **Physical Ground Truth:** Cryptography proves that evidence has not been tampered with since ingestion. It cannot magically prove that a voter did not make an accidental mark or that physical paper was handled correctly inside a booth. That is why physical procedures and paper VVPAT records remain legally sovereign.
2. **Not "Quantum-Proof":** We explicitly label our system **"Quantum-Resilient using specified post-quantum cryptographic algorithms (ML-DSA / ML-KEM)"**, never "Quantum-Proof".
3. **Not 100% Secure Election:** No electronic system can ever guarantee a "100% secure election". Q-Audit provides mathematical evidence integrity and decentralized trust.
