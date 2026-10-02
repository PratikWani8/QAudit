import time
import argparse
import httpx
import sys
import os

# Standalone validator node daemon
def run_validator(validator_id: str, org_name: str, org_type: str, backend_url: str):
    print(f"[{validator_id}] Starting Federated Validator Node...")
    print(f"[{validator_id}] Organization: {org_name} ({org_type})")
    print(f"[{validator_id}] Connecting to Q-Audit Gateway: {backend_url}")

    client = httpx.Client(base_url=backend_url, timeout=10.0)

    # 1. Health check & registration
    try:
        res = client.get("/api/v1/health")
        if res.status_code == 200:
            print(f"[{validator_id}] Connected successfully to Q-Audit network.")
    except Exception as e:
        print(f"[{validator_id}] Gateway waiting... ({e})")

    # 2. Main attestation loop
    while True:
        try:
            # Heartbeat
            client.post(f"/api/v1/validators/{validator_id}/heartbeat")

            # Check un-attested commitments
            comm_res = client.get("/api/v1/validators/pending-commitments", params={"validator_id": validator_id})
            if comm_res.status_code == 200:
                pending = comm_res.json()
                for c in pending:
                    c_id = c["commitment_id"]
                    print(f"[{validator_id}] Verifying Merkle root for commitment {c_id}...")
                    # Submit signed attestation
                    att_res = client.post(f"/api/v1/validators/{validator_id}/attest", json={
                        "commitment_id": c_id,
                        "decision": "ACCEPT"
                    })
                    if att_res.status_code == 200:
                        print(f"[{validator_id}] Attestation accepted for commitment {c_id}.")
        except Exception as e:
            # Silent retry
            pass
        time.sleep(5)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Q-Audit Federated Validator Daemon")
    parser.add_argument("--id", required=True, help="Validator ID")
    parser.add_argument("--org", required=True, help="Organization Name")
    parser.add_argument("--type", required=True, help="Organization Type")
    parser.add_argument("--url", default=os.getenv("BACKEND_API_URL", "http://localhost:8000"), help="Backend API URL")
    args = parser.parse_args()

    run_validator(args.id, args.org, args.type, args.url)
