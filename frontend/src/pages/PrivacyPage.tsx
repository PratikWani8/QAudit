import React, { useState } from "react";
import { EyeOff, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Play, Key, Fingerprint, Lock } from "lucide-react";
import { privacyApi } from "../services/api";

export const PrivacyPage: React.FC = () => {
  const [voterSecret, setVoterSecret] = useState("citizen_biometric_derived_secret_8899");
  const [electionId, setElectionId] = useState("DEMO-NATIONAL-2026");
  const [credential, setCredential] = useState<any>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [nullifierResult, setNullifierResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Generate anonymous credential
  const handleGenerateCredential = async () => {
    setLoading(true);
    try {
      const cred = await privacyApi.generateCredential(voterSecret, electionId);
      setCredential(cred);
      // Auto generate ZK proof
      const proof = await privacyApi.createProof(voterSecret, electionId);
      setZkProof(proof);
      // Auto verify ZK proof
      const ver = await privacyApi.verifyEligibility({
        election_id: electionId,
        credential_commitment: cred.credential_commitment,
        proof_data: proof,
        anonymous_voting_credential: "ANON-CRED-TOKEN-VALID"
      });
      setVerificationResult(ver);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Nullifier
  const handleSubmitNullifier = async () => {
    if (!credential) return;
    try {
      const res = await privacyApi.submitNullifier(electionId, credential.nullifier_hash);
      setNullifierResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <EyeOff className="w-6 h-6 text-emerald-400" />
          Zero-Knowledge Privacy & Anonymous Nullifiers
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Proving voter eligibility mathematically without linking identity to votes. Enforcing single-use nullifiers per election.
        </p>
      </div>

      {/* Architectural Separation Flow Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Cryptographic Domain Separation Architecture</h3>
        <p className="text-xs text-slate-400">
          The evidence database never stores <code className="text-rose-400">voter_identity + vote_choice</code> together.
          Voter secret keys generate anonymous credentials and election-specific nullifiers:
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-center">
          <span className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">IDENTITY</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">ELIGIBILITY</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300">ANON CREDENTIAL</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-2 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">ZK PROOF</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">NULLIFIER</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">EVIDENCE DOMAIN</span>
        </div>
      </div>

      {/* Interactive ZK Demonstration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Client Derivation */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Key className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">1. Client-Side Secret & ZK Prover</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Voter Secret Token (Client-Side Only):</label>
              <input
                type="text"
                value={voterSecret}
                onChange={(e) => setVoterSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Election Context:</label>
              <input
                type="text"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleGenerateCredential}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? "Generating ZK Proof..." : "Generate ZK Proof & Nullifier"}
            </button>
          </div>

          {credential && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
              <div>
                <span className="text-slate-400">Anonymous Public Commitment (Y = G^x mod P):</span>
                <div className="code-badge text-cyan-300 truncate mt-1">{credential.credential_commitment}</div>
              </div>
              <div>
                <span className="text-slate-400">Derived Election-Specific Nullifier:</span>
                <div className="code-badge text-emerald-300 truncate mt-1">{credential.nullifier_hash}</div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: ZK Verification & Nullifier Enforcement */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Fingerprint className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">2. Verifier & Double-Voting Barrier</h3>
          </div>

          {verificationResult ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span>Zero-Knowledge Verification:</span>
                  <span className="badge-verified">ELIGIBLE</span>
                </div>
                <div className="text-[11px] text-slate-300">{verificationResult.message}</div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Identity Revealed: FALSE (100% Zero-Knowledge)
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSubmitNullifier}
                  className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" /> Submit Nullifier to Election Log
                </button>
              </div>

              {nullifierResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
                    nullifierResult.status === "ACCEPTED"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {nullifierResult.status === "ACCEPTED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{nullifierResult.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{nullifierResult.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-center py-16 text-xs font-mono">
              Generate a client-side proof on the left to test verification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
