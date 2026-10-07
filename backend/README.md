# Q-AUDIT Backend

Quantum-Resilient, Privacy-Preserving Election Verification & Audit Network.

The Q-AUDIT backend is a Python FastAPI service responsible for election evidence processing, cryptographic verification, audit workflows, validator consensus, privacy mechanisms, and security event handling.

## Tech Stack

- Python 3.11+
- FastAPI
- Pydantic v2
- SQLAlchemy 2.0
- PostgreSQL 16
- SQLite local fallback
- Uvicorn
- ML-DSA
- ML-KEM
- SHA3-256 / SHA3-512

## Core Responsibilities

- Election and evidence management
- SHA-3 hashing and Merkle tree generation
- ML-DSA signature verification
- ML-KEM secure communication support
- QRNG audit selection
- Zero-knowledge nullifier handling
- 4/5 BFT validator consensus
- Security event detection
- Attack simulation support

## Setup

From the project root:

```bash
python -m venv venv
```

Windows:

```bash
.\venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Seed demo data:

```bash
$env:PYTHONPATH="backend"
python backend/app/database/seed_demo_data.py
```

Start the backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

## Database

The backend uses PostgreSQL for the main deployment and SQLite as a local zero-configuration fallback.

Main data areas include:

- Elections
- Candidates
- Polling stations
- Evidence
- Cryptographic commitments
- Validators
- Validator attestations
- Audit runs
- Audit samples
- Nullifiers
- Security events
- Users

## Testing

From the project root:

```bash
$env:PYTHONPATH="backend"
pytest tests/ -v
```

## Docker

Run the complete Q-AUDIT system from the project root:

```bash
docker compose up --build
```

## Project

> Don't decentralize the vote. Decentralize the trust.
