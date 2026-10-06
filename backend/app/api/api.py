from fastapi import APIRouter
from app.api.endpoints import auth, elections, evidence, validators, audits, privacy, security, dashboard, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(elections.router, prefix="/elections", tags=["Elections"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Evidence & Merkle Trees"])
api_router.include_router(validators.router, prefix="/validators", tags=["Validator Network & BFT"])
api_router.include_router(audits.router, prefix="/audits", tags=["QRNG & Audit System"])
api_router.include_router(privacy.router, prefix="/zk", tags=["Zero-Knowledge & Privacy"])
api_router.include_router(privacy.router, prefix="/vote", tags=["Nullifiers & Voting"])
api_router.include_router(security.router, prefix="/security", tags=["Security & Attack Lab"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Stats"])
