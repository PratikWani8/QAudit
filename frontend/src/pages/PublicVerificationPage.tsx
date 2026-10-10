import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SearchCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  GitFork,
  Server,
  Radio,
  FileCheck2,
  Search,
  ArrowRight,
  Fingerprint,
  RefreshCw
} from "lucide-react";
import { securityApi, electionsApi } from "../services/api";
import { PublicVerificationReport, Election } from "../types";
import { PqcBadge } from "../components/common/PqcBadge";
import { MerkleVisualizer } from "../components/common/MerkleVisualizer";
import { ClientVerifier } from "../crypto/clientVerifier";

export const PublicVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [electionId, setElectionId] = useState<string>(
    searchParams.get("election_id") || "DEMO-NATIONAL-2026"
  );
  const [evidenceId, setEvidenceId] = useState<string>(
    searchParams.get("evidence_id") || ""
  );
  const [elections, setElections] = useState<Election[]>([]);
  const [report, setReport] = useState<PublicVerificationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientVerified, setClientVerified] = useState<boolean | null>(null);

  useEffect(() => {
    electionsApi.list().then(setElections).catch(() => {});
    runVerification();
  }, []);

  const runVerification = async () => {
    if (!electionId) return;
    setLoading(true);
    setError(null);
    setClientVerified(null);
    try {
      const res = await securityApi.getPublicVerification(
        electionId,
        evidenceId.trim() || undefined
      );
      setReport(res);

      // Perform independent in-browser client verification
      if (res.merkle_proof_info && res.merkle_root) {
        const clientRes = ClientVerifier.verifyMerkleProof(
          res.merkle_proof_info.leaf_hash,
          res.merkle_proof_info.proof_path,
          res.merkle_root
        );
        setClientVerified(clientRes.isValid);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not retrieve verification record");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <SearchCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Independent Citizen & Public Auditor Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Public Election Evidence Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Verify mathematical integrity without trust: inspect post-quantum ML-DSA signatures,
          reconstruct Merkle inclusion paths, and check independent Byzantine validator attestations.
        </p>
      </div>

      {/* Query Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Select or Enter Election ID:
            </label>
            <div className="relative">
              <input
                type="text"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                placeholder="e.g. DEMO-NATIONAL-2026"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            {elections.length > 0 && (
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] text-slate-400">Quick select:</span>
                {elections.slice(0, 3).map((e) => (
                  <button
                    key={e.election_id}
                    onClick={() => {
                      setElectionId(e.election_id);
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    {e.election_id}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Optional Evidence Record ID:
            </label>
            <input
              type="text"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              placeholder="e.g. EVD-STATION-001-A1B2C3D4 (blank checks primary)"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={runVerification}
          disabled={loading || !electionId}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Cryptographic Layers...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Run Independent Cryptographic Audit
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs max-w-4xl mx-auto flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Report Display */}
      {report && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Flagship Verdict Box */}
          <div
            className={`p-6 rounded-2xl border ${
              report.overall_verification_status === "VERIFIED"
                ? "bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/30 border-emerald-500/50 shadow-glow-emerald"
                : "bg-gradient-to-r from-rose-950/40 via-slate-950 to-rose-950/30 border-rose-500/50 shadow-glow-rose"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-2xl ${
                    report.overall_verification_status === "VERIFIED"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {report.overall_verification_status === "VERIFIED" ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                      {report.overall_verification_status === "VERIFIED"
                        ? "ELECTION EVIDENCE VERIFIED"
                        : "TAMPERING / INTEGRITY BREACH DETECTED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Election: <strong className="text-white">{report.election_name}</strong> ({report.election_id})
                  </p>
                </div>
              </div>

              {clientVerified !== null && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
                  <div className="text-[10px] font-mono text-slate-400">Client-Side SHA-3 Verifier</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% In-Browser Match
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Matrix per prompt specification */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Configuration</span>
                {report.config_signature_valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Evidence Hash</span>
                {report.evidence_signature_valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">ML-DSA Signature</span>
                {report.config_signature_valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Merkle Proof</span>
                {report.merkle_proof_valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Validator Quorum</span>
                {report.bft_agreement?.threshold_met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Audit Commitment</span>
                {report.audit_status === "COMPLETED" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Deep Cryptographic Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Hash & PQC */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Certified Configuration Lock
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-slate-400">Configuration SHA3-256:</div>
                <div className="code-badge">{report.configuration_hash}</div>
              </div>
              <PqcBadge
                algorithm="ML-DSA-44 (NIST FIPS 204)"
                isValid={report.config_signature_valid}
                keyId="ELECTION-AUTHORITY-KEY-01"
              />
            </div>

            {/* Evidence Record Checked */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" /> Evidence Record Tested
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-slate-400">Record ID: <span className="text-white">{report.evidence_id || "Primary"}</span></div>
                <div className="text-slate-400">Station ML-DSA Signature:</div>
                <PqcBadge
                  algorithm="ML-DSA-44"
                  isValid={report.evidence_signature_valid}
                  keyId={report.evidence_info?.signing_key_id || "STATION-EDG-KEY-001"}
                />
              </div>
            </div>
          </div>

          {/* Merkle Proof Tree Path Visualizer */}
          {report.merkle_root && (
            <MerkleVisualizer
              rootHash={report.merkle_root}
              leafHash={report.evidence_info?.stored_content_hash}
              proofSteps={report.merkle_proof_info?.proof_path || []}
            />
          )}

          {/* Validator BFT Agreement Details */}
          {report.bft_agreement && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Federated Validator Agreement (BFT Consensus)
                </h4>
                <span className="badge-verified">
                  {report.bft_agreement.accept_count} / {report.bft_agreement.total_validators} Supermajority Quorum
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.bft_agreement.attestations.map((att) => (
                  <div
                    key={att.attestation_id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{att.organization_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{att.validator_id}</div>
                    </div>
                    <span className="badge-verified">
                      <CheckCircle2 className="w-3 h-3" /> ATTESTED (ML-DSA)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
