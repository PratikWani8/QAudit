import React, { useState, useEffect } from "react";
import { Server, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Power, Radio, Cpu } from "lucide-react";
import { validatorsApi, evidenceApi } from "../services/api";
import { ValidatorNode, BFTAgreementStatus, CryptographicCommitment } from "../types";
import { PqcBadge } from "../components/common/PqcBadge";

export const ValidatorNetworkPage: React.FC = () => {
  const [validators, setValidators] = useState<ValidatorNode[]>([]);
  const [commitments, setCommitments] = useState<CryptographicCommitment[]>([]);
  const [bftStatus, setBftStatus] = useState<BFTAgreementStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vals, commits] = await Promise.all([
        validatorsApi.list(),
        evidenceApi.getCommitments("DEMO-NATIONAL-2026"),
      ]);
      setValidators(vals);
      setCommitments(commits);

      if (commits.length > 0) {
        const bft = await validatorsApi.getBftStatus(commits[0].commitment_id);
        setBftStatus(bft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleNode = async (vId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ONLINE" ? "OFFLINE" : "ONLINE";
    try {
      await validatorsApi.simulateFailure(vId, nextStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const onlineCount = validators.filter((v) => v.status === "ONLINE").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            Federated Validator Network & BFT Agreement
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            5 independent validator authorities executing post-quantum attestation and Byzantine Fault Tolerant threshold consensus.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-slate-300 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} /> Refresh
        </button>
      </div>

      {/* Consensus Summary Banner */}
      {bftStatus && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="badge-quantum">BYZANTINE FAULT TOLERANCE</span>
              <h3 className="text-lg font-bold text-white mt-1">
                Threshold Agreement State: <span className={bftStatus.threshold_met ? "text-emerald-400" : "text-amber-400"}>{bftStatus.status}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Online: <strong className="text-white">{onlineCount} / {validators.length}</strong>
              </span>
              <span className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Attestations: <strong className="text-cyan-300">{bftStatus.accept_count} / {bftStatus.total_validators}</strong>
              </span>
              <span className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Quorum: <strong className={bftStatus.threshold_met ? "text-emerald-400" : "text-rose-400"}>4/5 Threshold</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5 Validator Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validators.map((val) => (
          <div
            key={val.validator_id}
            className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-cyan-300 border border-slate-800">
                    {val.organization_type}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1.5">{val.organization_name}</h3>
                  <div className="text-[11px] font-mono text-slate-400">{val.validator_id}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    val.status === "ONLINE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {val.status}
                </span>
              </div>

              {/* Public Key Display */}
              <div className="space-y-1 font-mono text-xs">
                <div className="text-slate-400 text-[10px]">ML-DSA Public Key (FIPS 204):</div>
                <div className="code-badge text-[10px] truncate">{val.public_key}</div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-900">
                <span>Last Telemetry Heartbeat:</span>
                <span className="text-slate-200">{new Date(val.last_seen).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Toggle Status Button */}
            <button
              onClick={() => handleToggleNode(val.validator_id, val.status)}
              className={`w-full mt-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                val.status === "ONLINE"
                  ? "bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900"
                  : "bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {val.status === "ONLINE" ? "Simulate Node Dropout" : "Restart Validator Node"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
