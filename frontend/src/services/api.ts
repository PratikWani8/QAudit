import axios from "axios";
import {
  Election,
  EvidenceRecord,
  MerkleProofResponse,
  CryptographicCommitment,
  ValidatorNode,
  BFTAgreementStatus,
  AuditRun,
  SecurityEvent,
  DashboardStats,
  PublicVerificationReport,
  Role,
  User
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qaudit_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  },
  switchDemoRole: async (role: Role) => {
    const res = await api.post(`/auth/demo-switch-role?role_name=${role}`);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export const electionsApi = {
  list: async (): Promise<Election[]> => {
    const res = await api.get("/elections");
    return res.data;
  },
  get: async (id: string): Promise<Election> => {
    const res = await api.get(`/elections/${id}`);
    return res.data;
  },
  create: async (data: any): Promise<Election> => {
    const res = await api.post("/elections", data);
    return res.data;
  },
  lock: async (id: string) => {
    const res = await api.post(`/elections/${id}/lock`);
    return res.data;
  },
  verify: async (id: string) => {
    const res = await api.get(`/elections/${id}/verify`);
    return res.data;
  },
};

export const evidenceApi = {
  list: async (electionId?: string): Promise<EvidenceRecord[]> => {
    const res = await api.get("/evidence", { params: { election_id: electionId } });
    return res.data;
  },
  get: async (id: string): Promise<EvidenceRecord> => {
    const res = await api.get(`/evidence/${id}`);
    return res.data;
  },
  submit: async (data: any): Promise<EvidenceRecord> => {
    const res = await api.post("/evidence", data);
    return res.data;
  },
  getProof: async (id: string): Promise<MerkleProofResponse> => {
    const res = await api.get(`/evidence/${id}/proof`);
    return res.data;
  },
  commitRoot: async (electionId: string): Promise<CryptographicCommitment> => {
    const res = await api.post(`/evidence/elections/${electionId}/commit`);
    return res.data;
  },
  getCommitments: async (electionId: string): Promise<CryptographicCommitment[]> => {
    const res = await api.get(`/evidence/elections/${electionId}/commitments`);
    return res.data;
  },
};

export const validatorsApi = {
  list: async (): Promise<ValidatorNode[]> => {
    const res = await api.get("/validators");
    return res.data;
  },
  attest: async (validatorId: string, commitmentId: string, decision: "ACCEPT" | "REJECT") => {
    const res = await api.post(`/validators/${validatorId}/attest`, {
      commitment_id: commitmentId,
      decision,
    });
    return res.data;
  },
  getBftStatus: async (commitmentId: string): Promise<BFTAgreementStatus> => {
    const res = await api.get(`/validators/commitments/${commitmentId}/bft-status`);
    return res.data;
  },
  simulateFailure: async (validatorId: string, status: string): Promise<ValidatorNode> => {
    const res = await api.post(
      `/validators/${validatorId}/simulate-failure?new_status=${status}`
    );
    return res.data;
  },
};

export const auditsApi = {
  run: async (electionId: string, sampleSize = 5, forceFallback = false): Promise<AuditRun> => {
    const res = await api.post("/audits", {
      election_id: electionId,
      sample_size: sampleSize,
      force_fallback: forceFallback,
    });
    return res.data;
  },
  get: async (auditId: string): Promise<AuditRun> => {
    const res = await api.get(`/audits/${auditId}`);
    return res.data;
  },
  listForElection: async (electionId: string): Promise<AuditRun[]> => {
    const res = await api.get(`/audits/election/${electionId}`);
    return res.data;
  },
  reproduce: async (data: {
    election_id: string;
    raw_entropy: string;
    public_commitment: string;
    sample_size?: number;
  }) => {
    const res = await api.post("/audits/reproduce", data);
    return res.data;
  },
  getQrngSample: async () => {
    const res = await api.get("/audits/qrng/sample");
    return res.data;
  },
};

export const privacyApi = {
  generateCredential: async (voterSecret: string, electionId: string) => {
    const res = await api.post(
      `/zk/generate-credential?voter_secret=${encodeURIComponent(voterSecret)}&election_id=${encodeURIComponent(electionId)}`
    );
    return res.data;
  },
  createProof: async (voterSecret: string, electionId: string) => {
    const res = await api.post(
      `/zk/create-proof?voter_secret=${encodeURIComponent(voterSecret)}&election_id=${encodeURIComponent(electionId)}`
    );
    return res.data;
  },
  verifyEligibility: async (payload: any) => {
    const res = await api.post("/zk/verify-eligibility", payload);
    return res.data;
  },
  submitNullifier: async (electionId: string, nullifierHash: string) => {
    const res = await api.post("/vote/nullifier", {
      election_id: electionId,
      nullifier_hash: nullifierHash,
    });
    return res.data;
  },
  listNullifiers: async (electionId: string) => {
    const res = await api.get(`/vote/nullifiers/${electionId}`);
    return res.data;
  },
};

export const securityApi = {
  getEvents: async (): Promise<SecurityEvent[]> => {
    const res = await api.get("/security/events");
    return res.data;
  },
  tamperEvidence: async (evidenceId: string, field = "voter_turnout", value = 9999) => {
    const res = await api.post(
      `/security/attacks/tamper-evidence?evidence_id=${evidenceId}&tampered_field=${field}&tampered_value=${value}`
    );
    return res.data;
  },
  forgeEvidence: async (electionId: string, stationId = "ROGUE-STATION-666") => {
    const res = await api.post(
      `/security/attacks/forge-evidence?election_id=${electionId}&station_id=${stationId}`
    );
    return res.data;
  },
  restoreEvidence: async (evidenceId: string) => {
    const res = await api.post(`/security/attacks/restore-evidence?evidence_id=${evidenceId}`);
    return res.data;
  },
  getPublicVerification: async (
    electionId: string,
    evidenceId?: string
  ): Promise<PublicVerificationReport> => {
    const res = await api.get(`/security/verification/${electionId}`, {
      params: { evidence_id: evidenceId },
    });
    return res.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/dashboard/stats");
    return res.data;
  },
};

export default api;
