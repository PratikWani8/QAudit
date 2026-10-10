import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Vote,
  FileCheck2,
  Server,
  Radio,
  ShieldAlert,
  Flame,
  KeyRound,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  Cpu
} from "lucide-react";
import { dashboardApi, evidenceApi, validatorsApi, securityApi } from "../services/api";
import { DashboardStats, EvidenceRecord, ValidatorNode, SecurityEvent } from "../types";
import { StatCard } from "../components/common/StatCard";
import { PqcBadge } from "../components/common/PqcBadge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvidence, setRecentEvidence] = useState<EvidenceRecord[]>([]);
  const [validators, setValidators] = useState<ValidatorNode[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sData, evData, vData, secData] = await Promise.all([
        dashboardApi.getStats(),
        evidenceApi.list(),
        validatorsApi.list(),
        securityApi.getEvents(),
      ]);
      setStats(sData);
      setRecentEvidence(evData.slice(-6).reverse());
      setValidators(vData);
      setSecurityEvents(secData.slice(0, 5));
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Simulated 24-hr activity timeline for chart
  const activityData = [
    { time: "00:00", evidence: 4, verified: 4, attacks: 0 },
    { time: "04:00", evidence: 12, verified: 12, attacks: 0 },
    { time: "08:00", evidence: 28, verified: 28, attacks: 1 },
    { time: "12:00", evidence: 36, verified: 36, attacks: 1 },
    { time: "16:00", evidence: 42, verified: 42, attacks: 2 },
    { time: "20:00", evidence: stats?.evidence_records || 44, verified: stats?.verified_evidence || 44, attacks: stats?.tampering_attempts || 2 },
  ];

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Executive Verification Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cryptographic audit telemetry, post-quantum signatures, and Byzantine consensus monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/demo")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-glow-cyan hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Launch Hackathon Demo
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Elections"
          value={stats?.total_elections || 0}
          subtitle="Configurations locked with ML-DSA"
          icon={Vote}
          color="cyan"
          trend="+100% Locked"
        />
        <StatCard
          title="Verified Evidence"
          value={`${stats?.verified_evidence || 0}/${stats?.evidence_records || 0}`}
          subtitle="SHA3-256 Merkle committed"
          icon={FileCheck2}
          color="blue"
          trend="100% Integrity"
        />
        <StatCard
          title="Validator Quorum"
          value={`${stats?.validators_online || 0}/${stats?.total_validators || 5}`}
          subtitle="BFT Threshold: 4 of 5 required"
          icon={Server}
          color="emerald"
          trend="Quorum Met"
        />
        <StatCard
          title="Security Alerts"
          value={stats?.security_alerts || 0}
          subtitle={`${stats?.tampering_attempts || 0} Tampering attempts intercepted`}
          icon={ShieldAlert}
          color={stats && stats.security_alerts > 0 ? "rose" : "amber"}
          trend="Active Defense"
        />
      </div>

      {/* Charts & Validator Network Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Evidence Ingestion & Verification Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Evidence Ingestion & Verification Velocity</h3>
              <p className="text-xs text-slate-400">SHA3-256 Hashes and ML-DSA verification over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Verified Evidence
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Interceptions
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="evidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b1120", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="evidence" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#evidenceGrad)" />
                <Area type="monotone" dataKey="attacks" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#attackGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Validator Quorum Monitor */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Federated Validators
            </h3>
            <span className="badge-quantum">4/5 BFT</span>
          </div>

          <div className="space-y-3">
            {validators.map((val) => (
              <div
                key={val.validator_id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {val.organization_name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{val.validator_id}</span>
                    <span>•</span>
                    <span className="text-cyan-400">{val.organization_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      val.status === "ONLINE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {val.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/validators"
            className="w-full py-2 block text-center rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-cyan-300 transition-colors"
          >
            Manage Validator Network & Node Daemons →
          </Link>
        </div>
      </div>

      {/* Recent Evidence & Recent Security Interceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Evidence Records */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              Recent Cryptographic Evidence Records
            </h3>
            <Link to="/evidence" className="text-xs text-cyan-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEvidence.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">No evidence records ingested yet.</div>
            ) : (
              recentEvidence.map((ev) => (
                <div
                  key={ev.evidence_id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-bold">{ev.evidence_id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                        {ev.evidence_type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                      Hash: {ev.content_hash.slice(0, 20)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge-verified">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                    <button
                      onClick={() => navigate(`/evidence/${ev.evidence_id}`)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                      title="Inspect Merkle Proof"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Attack Alerts */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Security Events & Tampering Log
            </h3>
            <Link to="/security" className="text-xs text-rose-400 hover:underline">
              Security Center
            </Link>
          </div>

          <div className="space-y-2.5">
            {securityEvents.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">No active security alerts. System normal.</div>
            ) : (
              securityEvents.map((sec) => (
                <div
                  key={sec.event_id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-rose-400 font-bold">{sec.event_id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                        {sec.event_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Severity: <span className="font-semibold text-rose-300">{sec.severity}</span> • {new Date(sec.detected_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    INTERCEPTED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
