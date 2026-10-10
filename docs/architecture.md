# Q-Audit System Architecture

> **Core Tagline:** *"Don't decentralize the vote. Decentralize the trust."*

---

## 1. Architectural Philosophy & Principle

Q-Audit is explicitly designed as an **independent cryptographic evidence and audit layer** placed around existing or simulated physical election processes. 

It does **NOT** replace:
- Electronic Voting Machines (EVMs)
- Voter Verified Paper Audit Trails (VVPAT)
- Election Authorities or Returning Officers
- Constitutional and legal election procedures
- The legally certified election result

```mermaid
graph TD
    A["Existing / Simulated Election Process (EVM / VVPAT)"] -->|Raw Station Events| B["Evidence Gateway (RFC 8785 Canonical JSON)"]
    B --> C["Cryptographic Verification Layer"]
    C -->|SHA3-256 Hashing| D["Merkle Tree Construction"]
    C -->|NIST FIPS 204| E["ML-DSA Lattice Signatures"]
    D --> F["Certified Merkle Root"]
    E --> F
    G["ANU Quantum Optics (QRNG)"] -->|Vacuum Fluctuations| H["Quantum Entropy Register"]
    H -->|Entropy Commitment| I["Deterministic Audit Selection"]
    F --> I
    F --> J["Federated Validator Network"]
    subgraph "Federated Validator Network (BFT 4/5 Quorum)"
        V1["Validator 1 - Government"]
        V2["Validator 2 - Auditor"]
        V3["Validator 3 - University"]
        V4["Validator 4 - Observer"]
        V5["Validator 5 - Cyber Command"]
    end
    J --> V1
    J --> V2
    J --> V3
    J --> V4
    J --> V5
    V1 -->|Signed Attestation| K["Transparency Log Consensus"]
    V2 -->|Signed Attestation| K
    V3 -->|Signed Attestation| K
    V4 -->|Signed Attestation| K
    V5 -->|Signed Attestation| K
    K --> L["Public Verification Portal (Logarithmic Merkle Proofs)"]
    I --> L
```

---

## 2. Strict Domain Separation: Identity vs. Evidence

In strict accordance with democratic ballot privacy, the evidence database **NEVER** stores:
$$\text{voter\_identity} + \text{vote\_choice}$$

Instead, the architecture enforces a 6-stage mathematical pipeline:
1. **Identity Provider Domain:** Authenticates citizen citizenship and issues blind eligibility credential.
2. **Eligibility Domain:** Confirms eligibility without associating name to candidate.
3. **Anonymous Credential:** Client-side token deriving public commitment $Y = G^x \pmod P$.
4. **Zero-Knowledge Proof:** Non-interactive Sigma protocol / Fiat-Shamir proof of knowledge proving possession of secret $x$ without revealing it.
5. **Election Nullifier:** Deterministic, election-specific hash $\text{SHA3-256}(x \parallel \text{election\_id})$ that prevents duplicate voting without tracking identity.
6. **Evidence Domain:** Stores only anonymous commitments, Merkle proofs, and station telemetry.
