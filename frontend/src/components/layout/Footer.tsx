import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050810] border-t border-slate-900 py-6 px-4 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Core Notice Box */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">System Notice & Architecture Boundary: </span>
            Q-Audit is a national-hackathon research prototype demonstrating quantum-resilient cryptographic evidence integrity,
            independent Merkle auditing, zero-knowledge privacy, and federated Byzantine agreement.
            It does NOT replace EVMs, VVPAT paper audits, election authorities, or legally certified election results.
            Q-Audit operates as an external, independent mathematical evidence layer placed around an existing or simulated election process.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Q-Audit Network • "Don't decentralize the vote. Decentralize the trust."</span>
          </div>
          <div>
            <span>NIST FIPS 204 (ML-DSA) • FIPS 203 (ML-KEM) • FIPS 202 (SHA-3) • ANU Quantum QRNG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
