# Q-Audit: Killer Hackathon Demonstration Script

This presentation script guides you through demonstrating Q-Audit to judges in under 7 minutes.

---

### Step-by-Step Hackathon Walkthrough:

1. **Open Demo Mode (`/demo`):**
   - Click **"Killer Demo Mode"** in the top navigation bar.
2. **Step 1 & 2 (Election Creation):**
   - Show the simulated *National Demonstration Election 2026* with 4 candidates and 10 polling stations.
3. **Step 3 (ML-DSA Configuration Lock Ceremony):**
   - Click *Execute ML-DSA Configuration Lock*.
   - Point out the pipeline: `Configuration -> Canonical JSON -> SHA3-256 Hash -> ML-DSA-44 Signature -> Status: LOCKED`.
4. **Step 4 & 5 (Evidence Engine & Merkle Tree):**
   - Ingest station packages (`poll_opened`, `device_commitment`, `station_summary`, `poll_closed`).
   - Construct binary Merkle tree and display certified Merkle Root.
5. **Step 6 & 7 (QRNG Audit Selection):**
   - Sample live quantum entropy from Australian National University (ANU) quantum optics API.
   - Combine with public election commitment to generate deterministic audit sample of stations.
6. **Step 8 & 9 (Federated BFT Agreement):**
   - Point out the 5 independent validator institutions: Government, Auditor, University, Observer, Cyber Command.
   - Show 4/5 supermajority consensus reached!
7. **Step 10 (Public Verification Portal):**
   - Open `/verify`. Show all 6 green checkpoints: Configuration ✓, Evidence Hash ✓, ML-DSA Signature ✓, Merkle Proof ✓, Validator Agreement ✓, Audit Commitment ✓.
   - Demonstrate **100% In-Browser Independent Client Verification** using client-side Web Crypto and SHA-3!
8. **Step 11 & 12 (THE KILLER ATTACK DEMO):**
   - Open Attack Lab (`/attack-lab`).
   - Click **"Tamper Record"** to modify turnout from 842 to 9999 directly in the database.
   - Re-run verification: **TAMPERING DETECTED!**
   - Show the red failure cascade: Content Hash Mismatch -> Merkle Proof Invalidation -> Signature Inconsistency -> Alert Broadcasted.
9. **Step 13 (Exact Audit Reproducibility):**
   - Click **"Independently Reproduce Audit Sample"**.
   - Show that entering the raw entropy and public commitment reproduces the exact identical stations with zero deviation!
10. **Step 14 (Zero-Knowledge & Nullifier Protection):**
    - Show ZK proof of eligibility: proves eligibility without revealing voter identity.
    - Submit nullifier once: ACCEPTED.
    - Submit nullifier twice: **REJECTED — DUPLICATE PARTICIPATION HALTED.**
