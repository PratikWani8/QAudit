import React from "react";
import { Code2, ExternalLink, ShieldCheck, Terminal, Cpu } from "lucide-react";

export const ApiDocsPage: React.FC = () => {
  const endpoints = [
    { method: "POST", path: "/api/v1/elections", desc: "Create election envelope (Super Admin / Authority)" },
    { method: "POST", path: "/api/v1/elections/{id}/lock", desc: "Execute ML-DSA configuration lock ceremony" },
    { method: "GET", path: "/api/v1/elections/{id}/verify", desc: "Cryptographically verify election configuration signature" },
    { method: "POST", path: "/api/v1/evidence", desc: "Ingest canonical JSON evidence record signed with station ML-DSA key" },
    { method: "GET", path: "/api/v1/evidence/{id}/proof", desc: "Generate logarithmic Merkle inclusion proof path" },
    { method: "POST", path: "/api/v1/evidence/elections/{id}/commit", desc: "Construct SHA3-256 Merkle tree and sign root" },
    { method: "GET", path: "/api/v1/validators", desc: "List federated validator nodes, ML-DSA public keys, and health status" },
    { method: "POST", path: "/api/v1/validators/{id}/attest", desc: "Submit signed validator attestation over commitment root" },
    { method: "POST", path: "/api/v1/audits", desc: "Execute QRNG-seeded deterministic audit run" },
    { method: "POST", path: "/api/v1/audits/reproduce", desc: "Publicly reproduce exact audit sample from raw entropy and commitment" },
    { method: "POST", path: "/api/v1/zk/verify-eligibility", desc: "Zero-Knowledge eligibility verification (Sigma protocol)" },
    { method: "POST", path: "/api/v1/vote/nullifier", desc: "Submit election nullifier; prevents duplicate participation" },
    { method: "GET", path: "/api/v1/security/verification/{election_id}", desc: "Master public verification report with 6 checkpoints" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            Developer API & PQC Standards Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            RESTful API, WebSocket telemetry, and post-quantum cryptographic primitives specification.
          </p>
        </div>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all self-start"
        >
          Interactive Swagger UI <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* PQC Standards Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Standardized Cryptographic Primitives (Zero Custom Crypto)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-bold">ML-DSA-44</div>
            <div className="text-[11px] text-slate-300">NIST FIPS 204 (Dilithium2)</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Module-Lattice digital signatures for election locks, station evidence, and validator attestations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-blue-400 font-bold">ML-KEM-512</div>
            <div className="text-[11px] text-slate-300">NIST FIPS 203 (Kyber512)</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Module-Lattice key encapsulation for post-quantum secure validator node communications.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-purple-400 font-bold">SHA3-256 / 512</div>
            <div className="text-[11px] text-slate-300">NIST FIPS 202 (Keccak)</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Sponge-based cryptographic hashing for evidence digests, Merkle tree nodes, and nullifiers.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Core API Endpoints (/api/v1)</h3>

        <div className="space-y-2">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === "POST" ? "bg-cyan-500/20 text-cyan-300" : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-slate-200 font-bold">{ep.path}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
