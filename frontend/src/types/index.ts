export type Role = "SUPER_ADMIN" | "ELECTION_AUTHORITY" | "VALIDATOR" | "AUDITOR" | "CITIZEN";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Candidate {
  id: number;
  candidate_id: string;
  election_id: string;
  candidate_hash: string;
  public_metadata: {
    name: string;
    party: string;
    symbol?: string;
    ballot_index?: number;
  };
}

export interface PollingStation {
  id: number;
  station_id: string;
  election_id: string;
  jurisdiction_hash: string;
  device_commitment: string;
  status: string;
}

export interface Election {
  id: number;
  election_id: string;
  name: string;
  jurisdiction: string;
  start_time: string;
  end_time: string;
  configuration_hash?: string;
  status: "DRAFT" | "LOCKED" | "ACTIVE" | "COMPLETED" | "AUDITED";
  signature?: string;
  signing_key_id?: string;
  created_at: string;
  updated_at: string;
  candidates: Candidate[];
  polling_stations: PollingStation[];
}

export interface EvidenceRecord {
  id: number;
  evidence_id: string;
  election_id: string;
  station_id: string;
  evidence_type: string;
  content_hash: string;
  storage_reference?: string;
  timestamp: string;
  signature: string;
  signing_key_id: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "TAMPERED";
  payload: Record<string, any>;
}

export interface MerkleProofStep {
  sibling_hash: string;
  direction: "left" | "right";
}

export interface MerkleProofResponse {
  evidence_id: string;
  leaf_hash: string;
  merkle_root: string;
  proof_path: MerkleProofStep[];
  is_valid: boolean;
  tree_size: number;
}

export interface CryptographicCommitment {
  id: number;
  commitment_id: string;
  election_id: string;
  evidence_hash: string;
  merkle_root: string;
  previous_root?: string;
  algorithm: string;
  signature: string;
  timestamp: string;
  status: string;
}

export interface ValidatorNode {
  id: number;
  validator_id: string;
  organization_name: string;
  organization_type: "GOVERNMENT" | "AUDITOR" | "ACADEMIC" | "OBSERVER" | "SECURITY";
  public_key: string;
  status: "ONLINE" | "OFFLINE" | "BYZANTINE";
  last_seen: string;
  endpoint_url?: string;
}

export interface AttestationResponse {
  id: number;
  attestation_id: string;
  commitment_id: string;
  validator_id: string;
  organization_name?: string;
  signature: string;
  decision: "ACCEPT" | "REJECT";
  timestamp: string;
}

export interface BFTAgreementStatus {
  commitment_id: string;
  merkle_root: string;
  total_validators: number;
  attestations_count: number;
  accept_count: number;
  reject_count: number;
  quorum_reached: boolean;
  threshold_met: boolean;
  status: "FINALIZED" | "IN_PROGRESS" | "FAILED";
  attestations: AttestationResponse[];
}

export interface AuditSampleItem {
  station_id: string;
  evidence_reference: string;
  selection_proof: {
    step: number;
    step_hash: string;
    rand_int: number;
    selected_index: number;
    remaining_pool_size: number;
  };
}

export interface AuditRun {
  audit_id: string;
  election_id: string;
  entropy_commitment: string;
  audit_seed_commitment: string;
  election_commitment?: string;
  algorithm_version: string;
  status: string;
  created_at: string;
  raw_entropy?: string;
  samples: AuditSampleItem[];
  is_quantum_true: boolean;
  qrng_source: string;
}

export interface SecurityEvent {
  id: number;
  event_id: string;
  event_type: "TAMPERING_ATTEMPT" | "FORGED_SIGNATURE" | "DUPLICATE_NULLIFIER" | "VALIDATOR_OFFLINE" | "VALIDATOR_BYZANTINE" | "CONSENSUS_BREACH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: Record<string, any>;
  detected_at: string;
  resolved: boolean;
}

export interface DashboardStats {
  total_elections: number;
  active_elections: number;
  evidence_records: number;
  verified_evidence: number;
  audit_runs: number;
  validators_online: number;
  total_validators: number;
  security_alerts: number;
  tampering_attempts: number;
}

export interface PublicVerificationReport {
  election_id: string;
  election_name: string;
  jurisdiction: string;
  election_status: string;
  configuration_hash: string;
  config_signature_valid: boolean;
  evidence_id?: string;
  evidence_info?: any;
  evidence_signature_valid: boolean;
  merkle_root?: string;
  merkle_proof_valid: boolean;
  merkle_proof_info?: MerkleProofResponse;
  bft_agreement?: BFTAgreementStatus;
  audit_status?: string;
  audit_run_id?: string;
  entropy_commitment?: string;
  overall_verification_status: "VERIFIED" | "TAMPERED" | "PENDING_CONSENSUS";
}
