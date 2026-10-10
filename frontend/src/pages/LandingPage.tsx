import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Sparkles,
  SearchCheck,
  Flame,
  Binary,
  Radio,
  Lock,
  Server,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers
} from "lucide-react";
import { dashboardApi } from "../services/api";
import { DashboardStats } from "../types";
import { motion } from "framer-motion";

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getStats().then(setStats).catch(() => {});
  }, []);

  const pillars = [
    {
      title: "Post-Quantum Signatures",
      subtitle: "NIST FIPS 204 (ML-DSA)",
      desc: "Lattice-based digital signatures resilient against Shor's algorithm on quantum computers. Every configuration lock and evidence record is signed with ML-DSA.",
      icon: Lock,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
    },
    {
      title: "Quantum Entropy Auditing",
      subtitle: "ANU QRNG + Deterministic Seed",
      desc: "Audit samples are derived from genuine quantum vacuum fluctuations combined with public election commitments. Deterministic and 100% reproducible.",
      icon: Radio,
      color: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
    },
    {
      title: "Federated BFT Agreement",
      subtitle: "3–5 Independent Validators",
      desc: "Government, university, observers, and security bodies independently verify evidence hashes, Merkle roots, and ML-DSA signatures to reach consensus.",
      icon: Server,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    },
    {
      title: "Zero-Knowledge Privacy",
      subtitle: "Separation of Identity & Nullifiers",
      desc: "Voter identity stays strictly in the identity domain. ZK proofs demonstrate eligibility without revealing 'who', while election-specific nullifiers prevent duplicate voting.",
      icon: Binary,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-[#070b14] text-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),transparent)] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>National Hackathon Research Prototype</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">PQC NIST Standards Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Quantum-Resilient, Privacy-Preserving <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Election Verification & Audit Network
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            "Don't decentralize the vote. <span className="font-semibold text-cyan-300">Decentralize the trust.</span>"
          </p>

          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            An external cryptographic evidence and audit layer placed around existing election processes.
            Combines NIST-standardized <strong className="text-slate-200">ML-DSA</strong> digital signatures,
            <strong className="text-slate-200"> SHA3-256 Merkle trees</strong>, <strong className="text-slate-200">QRNG entropy</strong>, and <strong className="text-slate-200">Zero-Knowledge proofs</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/demo")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan transition-all transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Start Guided Demo (14 Steps)
            </button>

            <button
              onClick={() => navigate("/verify")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-white hover:bg-slate-800 transition-all"
            >
              <SearchCheck className="w-4 h-4 text-cyan-400" />
              Public Verification Portal
            </button>

            <button
              onClick={() => navigate("/attack-lab")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-950/60 transition-all"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              Attack Simulation Lab
            </button>
          </div>
        </motion.div>
      </section>

      {/* Live Metrics Ribbon */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card text-center p-4 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase">Elections Tracked</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {stats ? stats.total_elections : "5"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">National & Regional</div>
        </div>

        <div className="glass-card text-center p-4 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase">Evidence Records</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {stats ? stats.evidence_records : "44"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">SHA3-256 + ML-DSA</div>
        </div>

        <div className="glass-card text-center p-4 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase">Federated Validators</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats ? `${stats.validators_online}/${stats.total_validators}` : "4/5"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">BFT Quorum Active</div>
        </div>

        <div className="glass-card text-center p-4 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase">Quantum Audits</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {stats ? stats.audit_runs : "3"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% Reproducible</div>
        </div>
      </section>

      {/* 4 Core Architectural Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Core Cryptographic & Distributed Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered strictly with mature, standardized cryptographic primitives. Never custom or unproven crypto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`glass-panel rounded-2xl p-6 border bg-gradient-to-br transition-all hover:scale-[1.01] ${pillar.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex-shrink-0">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{pillar.title}</h3>
                      <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {pillar.subtitle}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual System Architecture Pipeline */}
      <section className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              End-to-End Cryptographic Evidence Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Separation of Identity Domain, Evidence Domain, and Federated BFT Consensus
            </p>
          </div>
          <Link
            to="/architecture"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Architecture Specs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400">STAGE 1</span>
            <div className="font-bold text-cyan-300">Evidence Gateway</div>
            <div className="text-[11px] text-slate-400">Canonical JSON</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400">STAGE 2</span>
            <div className="font-bold text-blue-300">Crypto Layer</div>
            <div className="text-[11px] text-slate-400">SHA-3 & ML-DSA</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400">STAGE 3</span>
            <div className="font-bold text-purple-300">Merkle Trees</div>
            <div className="text-[11px] text-slate-400">Root Commitment</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400">STAGE 4</span>
            <div className="font-bold text-emerald-300">QRNG Auditing</div>
            <div className="text-[11px] text-slate-400">Quantum Vacuum Seed</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400">STAGE 5</span>
            <div className="font-bold text-amber-300">BFT Quorum</div>
            <div className="text-[11px] text-slate-400">4/5 Threshold Finalized</div>
          </div>
        </div>
      </section>
    </div>
  );
};
