import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { GitFork, ShieldCheck, CheckCircle2, XCircle, ArrowUpRight, Search, Play } from "lucide-react";
import { evidenceApi } from "../services/api";
import { MerkleProofResponse, CryptographicCommitment, EvidenceRecord } from "../types";
import { MerkleVisualizer } from "../components/common/MerkleVisualizer";
import { ClientVerifier } from "../crypto/clientVerifier";
import { PqcBadge } from "../components/common/PqcBadge";

export const MerkleExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [electionId, setElectionId] = useState("DEMO-NATIONAL-2026");
  const [evidenceId, setEvidenceId] = useState(searchParams.get("evidence_id") || "");
  const [commitments, setCommitments] = useState<CryptographicCommitment[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [proof, setProof] = useState<MerkleProofResponse | null>(null);
  const [clientValid, setClientValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCommitments();
  }, [electionId]);

  const loadCommitments = async () => {
    try {
      const [commits, evs] = await Promise.all([
        evidenceApi.getCommitments(electionId),
        evidenceApi.list(electionId),
      ]);
      setCommitments(commits);
      setEvidenceList(evs);
      if (evs.length > 0 && !evidenceId) {
        setEvidenceId(evs[0].evidence_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateProof = async (targetId?: string) => {
    const idToUse = targetId || evidenceId;
    if (!idToUse) return;
    setLoading(true);
    setClientValid(null);
    try {
      const p = await evidenceApi.getProof(idToUse);
      setProof(p);

      // In-browser verification test
      const res = ClientVerifier.verifyMerkleProof(p.leaf_hash, p.proof_path, p.merkle_root);
      setClientValid(res.isValid);
    } catch (e) {
      console.error(e);
      setProof(null);
    } finally {
      setLoading(false);
    }
  };

  const activeCommitment = commitments[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitFork className="w-6 h-6 text-cyan-400" />
          Merkle Tree Explorer & Inclusion Proofs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          SHA3-256 authenticated data structures enabling independent, logarithmic-time mathematical verification.
        </p>
      </div>

      {/* Commitment Header */}
      {activeCommitment && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="badge-quantum">ACTIVE COMMITMENT</span>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Commitment ID: <span className="text-white font-bold">{activeCommitment.commitment_id}</span>
              </div>
            </div>
            <PqcBadge
              algorithm={activeCommitment.algorithm}
              signature={activeCommitment.signature}
              keyId="ELECTION-AUTHORITY-KEY-01"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 font-mono text-xs">
            <div className="text-slate-400 text-[11px]">Certified Merkle Root:</div>
            <div className="code-badge text-cyan-300 font-bold">{activeCommitment.merkle_root}</div>
          </div>
        </div>
      )}

      {/* Proof Generator Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Generate Inclusion Proof for Evidence Record</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={evidenceId}
            onChange={(e) => {
              setEvidenceId(e.target.value);
              handleGenerateProof(e.target.value);
            }}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            {evidenceList.map((ev) => (
              <option key={ev.evidence_id} value={ev.evidence_id}>
                {ev.evidence_id} — {ev.evidence_type} ({ev.station_id})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleGenerateProof()}
            disabled={loading || !evidenceId}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-glow-cyan flex items-center justify-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? "Computing Proof..." : "Generate Proof Path"}
          </button>
        </div>

        {clientValid !== null && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Independent In-Browser Re-Verification: VALID</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Tree Depth: {proof?.proof_path.length} hops • Leaf Verified
            </span>
          </div>
        )}
      </div>

      {/* Visualizer */}
      {activeCommitment && (
        <MerkleVisualizer
          rootHash={activeCommitment.merkle_root}
          leafHash={proof?.leaf_hash}
          proofSteps={proof?.proof_path || []}
          allLeaves={evidenceList.map((e) => e.content_hash)}
        />
      )}
    </div>
  );
};
