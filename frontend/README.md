# Q-AUDIT Frontend

Quantum-Resilient, Privacy-Preserving Election Verification & Audit Network.

The Q-AUDIT frontend is a React-based interface for visualizing election evidence, cryptographic verification, validator consensus, QRNG audits, privacy mechanisms, and adversarial attack simulations.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts
- React Router v7
- Axios
- js-sha3

## Main Pages

- `/dashboard` — Executive Dashboard
- `/demo` — Hackathon Demo
- `/verify` — Public Verification Portal
- `/attack-lab` — Adversarial Attack Lab
- `/audits` — QRNG Audit Center
- `/merkle` — Merkle Tree Explorer
- `/privacy` — Zero-Knowledge Privacy Center

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend connects to the Q-AUDIT FastAPI backend, normally running at:

```text
http://127.0.0.1:8000
```

## Key Features

- Real-time election and validator monitoring
- Client-side cryptographic verification
- SHA-3 and Merkle proof visualization
- ML-DSA signature verification interface
- QRNG-based audit visualization
- Zero-knowledge privacy demonstration
- Adversarial attack simulations
- Security alerts and consensus status

## Docker

From the project root:

```bash
docker compose up --build
```
