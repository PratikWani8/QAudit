from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

# Auth & User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "CITIZEN"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# Candidate & Station
class CandidateBase(BaseModel):
    candidate_id: str
    public_metadata: Dict[str, Any]

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    election_id: str
    candidate_hash: str
    
    class Config:
        from_attributes = True

class PollingStationBase(BaseModel):
    station_id: str
    device_commitment: str
    jurisdiction_hash: Optional[str] = None

class PollingStationCreate(PollingStationBase):
    pass

class PollingStationResponse(PollingStationBase):
    id: int
    election_id: str
    status: str
    
    class Config:
        from_attributes = True

# Election Schemas
class ElectionCreate(BaseModel):
    election_id: str
    name: str
    jurisdiction: str
    start_time: datetime
    end_time: datetime
    candidates: List[CandidateCreate] = []
    polling_stations: List[PollingStationCreate] = []

class ElectionResponse(BaseModel):
    id: int
    election_id: str
    name: str
    jurisdiction: str
    start_time: datetime
    end_time: datetime
    configuration_hash: Optional[str] = None
    status: str
    signature: Optional[str] = None
    signing_key_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    candidates: List[CandidateResponse] = []
    polling_stations: List[PollingStationResponse] = []
    
    class Config:
        from_attributes = True

class ElectionLockResponse(BaseModel):
    election_id: str
    status: str
    canonical_json: str
    configuration_hash: str
    signature: str
    signing_key_id: str
    algorithm: str

# Evidence Schemas
class EvidenceCreate(BaseModel):
    election_id: str
    station_id: str
    evidence_type: str
    timestamp: Optional[datetime] = None
    payload: Dict[str, Any]
    signature: Optional[str] = None  # If submitted by edge station with its ML-DSA key, or signed by gateway
    signing_key_id: Optional[str] = "STATION-EDG-KEY-001"

class EvidenceResponse(BaseModel):
    id: int
    evidence_id: str
    election_id: str
    station_id: str
    evidence_type: str
    content_hash: str
    storage_reference: Optional[str] = None
    timestamp: datetime
    signature: str
    signing_key_id: str
    status: str
    payload: Dict[str, Any]
    
    class Config:
        from_attributes = True

class MerkleProofStep(BaseModel):
    sibling_hash: str
    direction: str  # 'left' or 'right'

class MerkleProofResponse(BaseModel):
    evidence_id: str
    leaf_hash: str
    merkle_root: str
    proof_path: List[MerkleProofStep]
    is_valid: bool
    tree_size: int

# Commitment & Validator Attestation
class CommitmentResponse(BaseModel):
    id: int
    commitment_id: str
    election_id: str
    evidence_hash: str
    merkle_root: str
    previous_root: Optional[str]
    algorithm: str
    signature: str
    timestamp: datetime
    status: str
    
    class Config:
        from_attributes = True

class ValidatorBase(BaseModel):
    validator_id: str
    organization_name: str
    organization_type: str
    public_key: str
    status: str = "ONLINE"
    endpoint_url: Optional[str] = None

class ValidatorCreate(ValidatorBase):
    pass

class ValidatorResponse(ValidatorBase):
    id: int
    last_seen: datetime
    
    class Config:
        from_attributes = True

class AttestationCreate(BaseModel):
    commitment_id: str
    decision: str = "ACCEPT"  # ACCEPT, REJECT
    signature: Optional[str] = None

class AttestationResponse(BaseModel):
    id: int
    attestation_id: str
    commitment_id: str
    validator_id: str
    organization_name: Optional[str] = None
    signature: str
    decision: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class BFTAgreementStatus(BaseModel):
    commitment_id: str
    merkle_root: str
    total_validators: int
    attestations_count: int
    accept_count: int
    reject_count: int
    quorum_reached: bool
    threshold_met: bool
    status: str # "FINALIZED", "IN_PROGRESS", "FAILED"
    attestations: List[AttestationResponse]

# QRNG & Audit
class AuditCreate(BaseModel):
    election_id: str
    algorithm_version: str = "Q-AUDIT-v1.0-NIST-PQC"
    sample_size: int = 5
    force_fallback: bool = False

class AuditSampleItem(BaseModel):
    station_id: str
    evidence_reference: str
    selection_proof: Dict[str, Any]

class AuditResponse(BaseModel):
    audit_id: str
    election_id: str
    entropy_commitment: str
    audit_seed_commitment: str
    election_commitment: Optional[str] = None
    algorithm_version: str
    status: str
    created_at: datetime
    raw_entropy: Optional[str] = None
    samples: List[AuditSampleItem] = []
    is_quantum_true: bool = False
    qrng_source: str = "ANU Quantum Optical Simulator / API"

class AuditReproduceRequest(BaseModel):
    election_id: str
    raw_entropy: str
    public_commitment: str
    sample_size: int = 5

class AuditReproduceResponse(BaseModel):
    original_seed: str
    reproduced_seed: str
    seeds_match: bool
    reproduced_samples: List[str]
    matches_original: bool

# Privacy / ZK / Nullifiers
class ZKProofSubmit(BaseModel):
    election_id: str
    credential_commitment: str  # Pedersen/Schnorr commitment
    proof_data: Dict[str, Any]  # ZK proof transcript: { c, s, G_point, H_point, public_key }
    anonymous_voting_credential: str

class ZKProofVerifyResponse(BaseModel):
    is_valid: bool
    verified_at: datetime
    message: str
    election_id: str
    identity_revealed: bool = False  # NEVER revealed!
    proof_system: str = "Sigma-Protocol / Fiat-Shamir Heuristic (Zero Knowledge Proof of Secret Key Possession)"

class NullifierSubmit(BaseModel):
    election_id: str
    nullifier_hash: str
    credential_proof: Optional[Dict[str, Any]] = None

class NullifierResponse(BaseModel):
    status: str  # "ACCEPTED", "DUPLICATE_REJECTED"
    nullifier_hash: str
    election_id: str
    message: str
    timestamp: datetime

# Security & Public Verification
class SecurityEventResponse(BaseModel):
    id: int
    event_id: str
    event_type: str
    severity: str
    details: Dict[str, Any]
    detected_at: datetime
    resolved: bool
    
    class Config:
        from_attributes = True

class PublicVerificationResponse(BaseModel):
    election_id: str
    election_name: str
    jurisdiction: str
    election_status: str
    configuration_hash: str
    config_signature_valid: bool
    evidence_id: Optional[str] = None
    evidence_content_hash: Optional[str] = None
    evidence_signature_valid: bool = False
    merkle_root: Optional[str] = None
    merkle_proof_valid: bool = False
    bft_agreement: Optional[BFTAgreementStatus] = None
    audit_status: Optional[str] = None
    overall_verification_status: str  # "VERIFIED", "TAMPERED", "INCOMPLETE"

class DashboardStats(BaseModel):
    total_elections: int
    active_elections: int
    evidence_records: int
    verified_evidence: int
    audit_runs: int
    validators_online: int
    total_validators: int
    security_alerts: int
    tampering_attempts: int
