import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Float
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="CITIZEN", nullable=False) # SUPER_ADMIN, ELECTION_AUTHORITY, VALIDATOR, AUDITOR, CITIZEN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Election(Base):
    __tablename__ = "elections"
    
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    jurisdiction = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    configuration_hash = Column(String(128), nullable=True) # SHA-3 hash of canonical config
    status = Column(String(50), default="DRAFT", nullable=False) # DRAFT, LOCKED, ACTIVE, COMPLETED, AUDITED
    signature = Column(Text, nullable=True) # ML-DSA signature by Election Authority
    signing_key_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    candidates = relationship("Candidate", back_populates="election", cascade="all, delete-orphan")
    polling_stations = relationship("PollingStation", back_populates="election", cascade="all, delete-orphan")
    evidence_records = relationship("Evidence", back_populates="election", cascade="all, delete-orphan")
    commitments = relationship("CryptographicCommitment", back_populates="election", cascade="all, delete-orphan")
    audit_runs = relationship("AuditRun", back_populates="election", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(100), index=True, nullable=False)
    election_id = Column(String(100), ForeignKey("elections.election_id"), nullable=False)
    candidate_hash = Column(String(128), nullable=False) # SHA-3 hash of public metadata
    public_metadata = Column(JSON, nullable=False) # { name, party, symbol, ballot_index }
    
    election = relationship("Election", back_populates="candidates")

class PollingStation(Base):
    __tablename__ = "polling_stations"
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(100), index=True, nullable=False)
    election_id = Column(String(100), ForeignKey("elections.election_id"), nullable=False)
    jurisdiction_hash = Column(String(128), nullable=False)
    device_commitment = Column(String(128), nullable=False) # Hardware/Firmware cryptographic commitment
    status = Column(String(50), default="ACTIVE") # ACTIVE, CLOSED, AUDITED
    
    election = relationship("Election", back_populates="polling_stations")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(String(100), unique=True, index=True, nullable=False)
    election_id = Column(String(100), ForeignKey("elections.election_id"), nullable=False)
    station_id = Column(String(100), index=True, nullable=False)
    evidence_type = Column(String(100), nullable=False) # poll_opened, device_commitment, poll_closed, station_summary, result_package, audit_event, validator_attestation
    content_hash = Column(String(128), nullable=False) # SHA-3 hash of canonical JSON payload
    storage_reference = Column(String(255), nullable=True) # IPFS/Storage URI or content address
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    signature = Column(Text, nullable=False) # ML-DSA digital signature
    signing_key_id = Column(String(100), nullable=False)
    status = Column(String(50), default="PENDING", nullable=False) # PENDING, VERIFIED, REJECTED, TAMPERED
    payload = Column(JSON, nullable=False) # Raw evidence event payload (NEVER stores voter identity + choice!)
    
    election = relationship("Election", back_populates="evidence_records")

class CryptographicCommitment(Base):
    __tablename__ = "cryptographic_commitments"
    
    id = Column(Integer, primary_key=True, index=True)
    commitment_id = Column(String(100), unique=True, index=True, nullable=False)
    election_id = Column(String(100), ForeignKey("elections.election_id"), nullable=False)
    evidence_hash = Column(String(128), nullable=False)
    merkle_root = Column(String(128), nullable=False)
    previous_root = Column(String(128), nullable=True)
    algorithm = Column(String(100), default="SHA3-256 + ML-DSA-44", nullable=False)
    signature = Column(Text, nullable=False) # Authority ML-DSA signature over Merkle root
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String(50), default="COMMITTED", nullable=False) # COMMITTED, FINALIZED, ATTESTED
    
    election = relationship("Election", back_populates="commitments")
    attestations = relationship("ValidatorAttestation", back_populates="commitment", cascade="all, delete-orphan")

class Validator(Base):
    __tablename__ = "validators"
    
    id = Column(Integer, primary_key=True, index=True)
    validator_id = Column(String(100), unique=True, index=True, nullable=False)
    organization_name = Column(String(255), nullable=False)
    organization_type = Column(String(100), nullable=False) # GOVERNMENT, AUDITOR, ACADEMIC, OBSERVER, SECURITY
    public_key = Column(Text, nullable=False) # ML-DSA Public Key in hex format
    status = Column(String(50), default="ONLINE", nullable=False) # ONLINE, OFFLINE, BYZANTINE
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    endpoint_url = Column(String(255), nullable=True)

class ValidatorAttestation(Base):
    __tablename__ = "validator_attestations"
    
    id = Column(Integer, primary_key=True, index=True)
    attestation_id = Column(String(100), unique=True, index=True, nullable=False)
    commitment_id = Column(String(100), ForeignKey("cryptographic_commitments.commitment_id"), nullable=False)
    validator_id = Column(String(100), ForeignKey("validators.validator_id"), nullable=False)
    signature = Column(Text, nullable=False) # ML-DSA signature by the validator over commitment root
    decision = Column(String(50), default="ACCEPT", nullable=False) # ACCEPT, REJECT
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    commitment = relationship("CryptographicCommitment", back_populates="attestations")
    validator = relationship("Validator")

class AuditRun(Base):
    __tablename__ = "audit_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String(100), unique=True, index=True, nullable=False)
    election_id = Column(String(100), ForeignKey("elections.election_id"), nullable=False)
    entropy_commitment = Column(String(128), nullable=False) # SHA-3 hash of QRNG entropy
    audit_seed_commitment = Column(String(128), nullable=False) # SHA-3 of (Entropy + Config/Merkle Commitment)
    election_commitment = Column(String(128), nullable=True) # Commitment used for audit derivation
    algorithm_version = Column(String(100), default="Q-AUDIT-v1.0-NIST-PQC", nullable=False)
    raw_entropy = Column(Text, nullable=True) # Publicly revealed post-audit for exact reproducibility
    status = Column(String(50), default="STARTED", nullable=False) # STARTED, COMPLETED, VERIFIED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    election = relationship("Election", back_populates="audit_runs")
    samples = relationship("AuditSample", back_populates="audit_run", cascade="all, delete-orphan")

class AuditSample(Base):
    __tablename__ = "audit_samples"
    
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String(100), ForeignKey("audit_runs.audit_id"), nullable=False)
    station_id = Column(String(100), nullable=False)
    evidence_reference = Column(String(100), nullable=False) # Reference to evidence_id
    selection_proof = Column(JSON, nullable=False) # Deterministic derivation proof (seed index, hash step)
    
    audit_run = relationship("AuditRun", back_populates="samples")

class Nullifier(Base):
    __tablename__ = "nullifiers"
    
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(String(100), index=True, nullable=False)
    nullifier_hash = Column(String(128), unique=True, index=True, nullable=False) # SHA3-256(voter_secret || election_id)
    first_seen_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="VALID", nullable=False) # VALID, DUPLICATE_ATTEMPTED

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=False) # TAMPERING_ATTEMPT, FORGED_SIGNATURE, DUPLICATE_NULLIFIER, VALIDATOR_OFFLINE, CONSENSUS_BREACH
    severity = Column(String(50), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    details = Column(JSON, nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved = Column(Boolean, default=False)
