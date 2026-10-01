from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings

router = APIRouter()

@router.get("")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "pqc_signature": settings.PQC_SIG_ALGORITHM,
        "pqc_kem": settings.PQC_KEM_ALGORITHM,
        "hash_algorithm": settings.HASH_ALGORITHM,
        "tagline": settings.TAGLINE
    }
