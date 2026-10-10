import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Filter, CheckCircle2, XCircle, Search, ExternalLink, Shield, Key } from "lucide-react";
import { evidenceApi, electionsApi } from "../services/api";
import { EvidenceRecord, Election } from "../types";
import { PqcBadge } from "../components/common/PqcBadge";

export const EvidenceExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [electionId, setElectionId] = useState<string>(searchParams.get("election_id") || "DEMO-NATIONAL-2026");
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEvidence();
  }, [electionId]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceApi.list(electionId || undefined);
      setEvidenceList(data);
      if (data.length > 0) {
        setSelectedRecord(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Cryptographic Evidence Records
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every polling station action generates a canonical JSON package hashed with SHA3-256 and signed with ML-DSA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
            placeholder="Filter by Election ID"
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List Column */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 max-h-[700px] overflow-y-auto">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider px-2">
            Records ({evidenceList.length})
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 text-center py-8">Loading evidence...</div>
          ) : evidenceList.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8">No records found.</div>
          ) : (
            <div className="space-y-2">
              {evidenceList.map((ev) => {
                const isSelected = selectedRecord?.evidence_id === ev.evidence_id;
                return (
                  <div
                    key={ev.evidence_id}
                    onClick={() => setSelectedRecord(ev)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500/50 shadow-glow-cyan"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-cyan-300 font-bold">{ev.evidence_id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          ev.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Type: <span className="text-slate-200">{ev.evidence_type}</span> • Station: {ev.station_id}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                      Hash: {ev.content_hash}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Record Detail Column */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          {selectedRecord ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-white">
                      {selectedRecord.evidence_id}
                    </span>
                    <span className="badge-verified">
                      <CheckCircle2 className="w-3 h-3" /> {selectedRecord.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Polling Station: {selectedRecord.station_id} • Ingested: {new Date(selectedRecord.timestamp).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/merkle?evidence_id=${selectedRecord.evidence_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors self-start"
                >
                  Verify Inclusion Proof →
                </button>
              </div>

              {/* SHA-3 Digest */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>SHA3-256 Content Hash:</span>
                  <span className="text-cyan-400 font-bold">256-bit Digest</span>
                </div>
                <div className="code-badge">{selectedRecord.content_hash}</div>
                <div className="text-[10px] text-slate-500">
                  Storage Reference: {selectedRecord.storage_reference || "N/A"}
                </div>
              </div>

              {/* ML-DSA Post-Quantum Signature */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Station Hardware ML-DSA Signature:
                </h4>
                <PqcBadge
                  algorithm="ML-DSA-44 (NIST FIPS 204)"
                  signature={selectedRecord.signature}
                  keyId={selectedRecord.signing_key_id}
                  isValid={selectedRecord.status === "VERIFIED"}
                />
              </div>

              {/* Canonical Payload Inspection */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-slate-400 text-xs font-semibold">
                    Canonical JSON Payload (RFC 8785 Sorted Representation):
                  </h4>
                  <span className="text-[10px] text-emerald-400">
                    Strict Identity Separation: 0 Voter ID Stored
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 overflow-x-auto leading-relaxed max-h-56">
                  <pre className="text-[11px] font-mono text-cyan-300/90">
                    {JSON.stringify(selectedRecord.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-20 text-xs">Select an evidence record to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
