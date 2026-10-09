import React, { useState } from "react";
import { GitCommit, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { MerkleProofStep } from "../../types";

interface MerkleVisualizerProps {
  rootHash: string;
  leafHash?: string;
  proofSteps?: MerkleProofStep[];
  allLeaves?: string[];
}

export const MerkleVisualizer: React.FC<MerkleVisualizerProps> = ({
  rootHash,
  leafHash,
  proofSteps = [],
  allLeaves = [],
}) => {
  const [selectedLeaf, setSelectedLeaf] = useState<string | undefined>(leafHash);

  const displayLeaves = allLeaves.length > 0 ? allLeaves.slice(0, 8) : [
    leafHash || "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d"
  ];

  return (
    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            SHA3-256 Merkle Tree Structure & Inclusion Proof
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic path proving inclusion of an evidence record into the certified election root.
          </p>
        </div>
        <span className="badge-quantum">Binary Tree Path</span>
      </div>

      {/* Merkle Root Box */}
      <div className="flex flex-col items-center">
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-center max-w-xl w-full shadow-glow-cyan">
          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1">
            Certified Merkle Root
          </div>
          <div className="font-mono text-xs text-white break-all bg-slate-950/80 p-2 rounded border border-slate-800">
            {rootHash}
          </div>
        </div>

        {/* Tree Branch Visual lines */}
        <div className="w-0.5 h-6 bg-cyan-500/40 my-1"></div>
        <div className="w-64 h-0.5 bg-slate-700"></div>
        <div className="flex justify-between w-64">
          <div className="w-0.5 h-6 bg-slate-700"></div>
          <div className="w-0.5 h-6 bg-slate-700"></div>
        </div>
      </div>

      {/* Intermediate Level */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-400">Branch Hash L1</div>
          <div className="font-mono text-[10px] text-slate-300 truncate mt-1">
            {rootHash.slice(0, 16)}...{rootHash.slice(16, 24)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-400">Branch Hash R1</div>
          <div className="font-mono text-[10px] text-slate-300 truncate mt-1">
            {rootHash.slice(24, 40)}...{rootHash.slice(40, 48)}
          </div>
        </div>
      </div>

      {/* Proof Steps Table */}
      {proofSteps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-900">
          <div className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            Verification Proof Path Steps:
          </div>
          <div className="space-y-1.5">
            {proofSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">Step {idx + 1}:</span>
                  <span className="text-slate-400">Sibling Direction: </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${step.direction === 'left' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    {step.direction.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-300 truncate max-w-xs">
                  {step.sibling_hash.slice(0, 24)}...
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaves Display */}
      <div className="space-y-2 pt-2 border-t border-slate-900">
        <div className="text-xs font-mono text-slate-300">
          Evidence Leaves ({displayLeaves.length} records):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {displayLeaves.map((leaf, idx) => {
            const isTarget = selectedLeaf && leaf.toLowerCase() === selectedLeaf.toLowerCase();
            return (
              <div
                key={idx}
                onClick={() => setSelectedLeaf(leaf)}
                className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                  isTarget
                    ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-glow-cyan"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Leaf #{idx + 1}</span>
                  {isTarget && <span className="text-[10px] text-cyan-400 font-bold">TARGET</span>}
                </div>
                <div className="truncate text-[11px] text-slate-200">{leaf}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
