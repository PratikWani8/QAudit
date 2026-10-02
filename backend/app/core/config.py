import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Q-Audit"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    TAGLINE: str = "Don't decentralize the vote. Decentralize the trust."
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "qaudit-national-hackathon-pqc-super-secure-key-2026-xyz789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./qaudit.db"  # Defaults to local SQLite file for instant run; overridden by postgres in docker
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Cryptographic & PQC settings
    PQC_SIG_ALGORITHM: str = "ML-DSA-44"  # Dilithium2 / FIPS 204
    PQC_KEM_ALGORITHM: str = "ML-KEM-512" # Kyber512 / FIPS 203
    HASH_ALGORITHM: str = "SHA3-256"
    
    # QRNG settings
    QRNG_API_URL: str = os.getenv("QRNG_API_URL", "https://qrng.anu.edu.au/API/jsonI.php?length=32&type=hex16&size=1")
    QRNG_USE_FALLBACK: bool = True  # Transparently fallback to cryptographically secure simulator if external API unreachable
    
    # Validator Network Consensus Parameters
    TOTAL_VALIDATORS: int = 5
    BFT_THRESHOLD: int = 4  # 4/5 supermajority or 3/5 quorum (tolerates f < n/3 or configured threshold)
    QUORUM_PERCENTAGE: float = 0.67
    
    class Config:
        case_sensitive = True

settings = Settings()
