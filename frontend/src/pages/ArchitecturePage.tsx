import React from "react";
import { Binary, Shield, Layers, Lock, Cpu, Server, EyeOff, AlertCircle } from "lucide-react";

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Binary className="w-6 h-6 text-cyan-400" />
          Q-Audit System Architecture & Threat Model
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive specification of the cryptographic evidence layer, privacy boundaries, and Byzantine consensus.
        </p>
      </div>

      {/* Tagline Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 text-center space-y-2">
        <div className="text-xl font-bold text-white font-mono">
          "Don't decentralize the vote. Decentralize the trust."
        </div>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto">
          Elections are sovereign national civic processes. Q-Audit never replaces election authorities, polling booths, EVMs, or paper VVPAT records.
          Instead, it places an unforgeable, post-quantum mathematical transparency log around election evidence.
        </p>
      </div>

      {/* Visual Layer Flow Diagram */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          5-Tier Architectural Stack
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-cyan-400 font-bold">LAYER 1: Existing/Simulated Election Process</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Physical polling booths, EVMs, and certified officer actions generating station summaries and device commitments.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">EXTERNAL BOUNDARY</span>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-blue-400 font-bold">LAYER 2: Cryptographic Verification Layer</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Deterministic JSON canonicalization (RFC 8785) • SHA3-256 Hashing • NIST FIPS 204 ML-DSA lattice signatures.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">POST-QUANTUM</span>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-purple-400 font-bold">LAYER 3: Quantum Entropy & Deterministic Audit</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                ANU QRNG optical vacuum fluctuations • SHA3-256 entropy commitment • Deterministic pseudorandom station sampling.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">QRNG REPRODUCIBLE</span>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-emerald-400 font-bold">LAYER 4: Federated Byzantine Consensus (BFT)</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                5 federated institutions (Government, Auditor, University, Observers, Cyber Command) reaching 4/5 threshold finalization.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">SUPERMAJORITY</span>
          </div>

          {/* Layer 5 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-amber-400 font-bold">LAYER 5: Public Verification & Zero-Knowledge Privacy</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Logarithmic Merkle inclusion proofs verified in citizen browsers • ZK eligibility proofs • Single-use election nullifiers.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">PUBLIC CITIZEN</span>
          </div>
        </div>
      </div>

      {/* Threat Model & Security Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Cryptographic Guarantees
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li><strong>Tamper Evidence:</strong> Any bit modification to stored evidence immediately breaks the SHA-3 hash, the Merkle tree root, and the ML-DSA signature.</li>
            <li><strong>Quantum Resilience:</strong> Signatures utilize Module-Lattice cryptography (ML-DSA / Dilithium) standardized by NIST in FIPS 204 to withstand quantum attacks.</li>
            <li><strong>Byzantine Resilience:</strong> The network tolerates rogue or offline validator nodes through a strict 4 of 5 threshold agreement.</li>
            <li><strong>Voter Privacy:</strong> Voter identity is strictly decoupled from vote choice; only anonymous commitments and nullifiers enter the public log.</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Explicit Non-Guarantees
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li><strong>Input Integrity:</strong> Cryptography verifies that evidence has not been tampered with post-ingestion; physical election procedures must ensure EVM inputs are legitimate.</li>
            <li><strong>Not an EVM Replacement:</strong> Q-Audit is not a digital ballot-box and does not replace legally binding physical election certificates.</li>
            <li><strong>Not 100% Impregnable:</strong> We do not claim '100% security' or 'quantum-proof'. We specify quantum-resilience under defined post-quantum cryptographic primitives.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
