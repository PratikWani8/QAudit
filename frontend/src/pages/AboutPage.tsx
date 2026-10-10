import React from "react";
import { Info, Shield, CheckCircle2, AlertTriangle, Sparkles, Heart } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Info className="w-6 h-6 text-cyan-400" />
          About Q-Audit Network
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Quantum-Resilient, Privacy-Preserving Election Verification & Audit Network.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#070b14] border border-cyan-500/30 text-center space-y-4 shadow-glow-cyan">
        <span className="badge-quantum">CORE MANIFESTO</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          "Don't decentralize the vote. Decentralize the trust."
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Voting is not a financial transaction on a public ledger. Voting is a sovereign civic right that requires
          strict physical paper verification, constitutional oversight, and uncompromising individual voter privacy.
          Instead of replacing sovereign election mechanisms with unvetted blockchains, Q-Audit builds an independent,
          federated mathematical audit envelope around existing election processes.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> The Problem with Generic "Blockchain Voting"
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generic blockchain voting projects dangerously propose replacing physical polling stations, EVMs, and paper VVPAT records
            with public blockchain transactions. This introduces coercion risks, vote-selling, catastrophic private key loss for ordinary citizens,
            and strips national election commissions of constitutional responsibility.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> The Q-Audit Architectural Breakthrough
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Q-Audit treats the physical election process as sovereign. It ingests machine and station evidence,
            anchors them into SHA-3 Merkle trees, signs them with post-quantum ML-DSA, validates them across federated institutions
            via BFT consensus, audits them via ANU Quantum optical randomness, and verifies eligibility using Zero-Knowledge proofs.
          </p>
        </div>
      </div>

      {/* Legal & Hackathon Scope */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
          Research Prototype Scope
        </div>
        <p className="leading-relaxed">
          Q-Audit was created as a National Hackathon prototype to prove that modern post-quantum cryptography (NIST FIPS 204 & 203),
          quantum optical entropy, zero-knowledge proofs, and Byzantine consensus can provide mathematically irrefutable evidence integrity
          without compromising individual ballot secrecy or constitutional legal procedures.
        </p>
      </div>
    </div>
  );
};
