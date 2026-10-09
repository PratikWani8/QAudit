import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check, Shield } from "lucide-react";

interface PqcBadgeProps {
  algorithm?: string;
  signature?: string;
  isValid?: boolean;
  keyId?: string;
  compact?: boolean;
}

export const PqcBadge: React.FC<PqcBadgeProps> = ({
  algorithm = "ML-DSA-44 (NIST FIPS 204)",
  signature,
  isValid = true,
  keyId = "ELECTION-AUTHORITY-KEY-01",
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (signature) {
      navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
        <Shield className="w-3 h-3 text-cyan-400" />
        <span>ML-DSA</span>
        {isValid ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        ) : (
          <XCircle className="w-3 h-3 text-rose-400" />
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Algorithm:</span>
          <span className="text-cyan-300">{algorithm}</span>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
            isValid
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
          }`}
        >
          {isValid ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> VALID
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" /> INVALID
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Signer Key ID: <span className="text-slate-200">{keyId}</span></span>
      </div>

      {signature && (
        <div className="pt-1 border-t border-slate-900 flex items-center justify-between gap-2">
          <div className="truncate text-slate-400 text-[11px]">
            <span className="text-slate-400">Sig: </span>
            <span className="text-cyan-400/90">{signature.slice(0, 36)}...{signature.slice(-16)}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 transition-colors"
            title="Copy full ML-DSA signature"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
};
