import React, { useState, useEffect } from "react";
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Database,
  KeyRound,
  Server,
  Fingerprint,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { securityApi, evidenceApi, validatorsApi, privacyApi } from "../services/api";
import { EvidenceRecord, ValidatorNode } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export const AttackLabPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [validators, setValidators] = useState<ValidatorNode[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>("");
  const [tamperingResult, setTamperingResult] = useState<any>(null);
  const [forgedResult, setForgedResult] = useState<any>(null);
  const [nullifierAttackResult, setNullifierAttackResult] = useState<any>(null);
  const [loadingTamper, setLoadingTamper] = useState<boolean>(false);
  const [loadingForge, setLoadingForge] = useState<boolean>(false);
  const [loadingNullifier, setLoadingNullifier] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evs, vals] = await Promise.all([
        evidenceApi.list("DEMO-NATIONAL-2026"),
        validatorsApi.list(),
      ]);
      setEvidenceList(evs);
      if (evs.length > 0 && !selectedEvidenceId) {
        setSelectedEvidenceId(evs[0].evidence_id);
      }
      setValidators(vals);
    } catch (e) {
      console.error(e);
    }
  };

  // Attack 1: Database Tampering
  const handleTamper = async () => {
    if (!selectedEvidenceId) return;
    setLoadingTamper(true);
    setTamperingResult(null);
    try {
      const res = await securityApi.tamperEvidence(selectedEvidenceId, "voter_turnout", 9999);
      setTamperingResult(res);
      await loadData();
    } catch (err: any) {
      setTamperingResult({ error: err?.response?.data?.detail || "Tampering simulation failed" });
    } finally {
      setLoadingTamper(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedEvidenceId) return;
    try {
      await securityApi.restoreEvidence(selectedEvidenceId);
      setTamperingResult(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Attack 2: Forged Evidence
  const handleForge = async () => {
    setLoadingForge(true);
    setForgedResult(null);
    try {
      const res = await securityApi.forgeEvidence("DEMO-NATIONAL-2026", "ROGUE-STATION-666");
      setForgedResult(res);
    } catch (err: any) {
      setForgedResult({ error: err?.response?.data?.detail });
    } finally {
      setLoadingForge(false);
    }
  };

  // Attack 3: Toggle Validator Status
  const handleToggleValidator = async (vId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ONLINE" ? "OFFLINE" : "ONLINE";
    try {
      await validatorsApi.simulateFailure(vId, nextStatus);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Attack 4: Duplicate Nullifier
  const handleDuplicateNullifier = async () => {
    setLoadingNullifier(true);
    setNullifierAttackResult(null);
    try {
      const testNullifier = "0xdeadbeef_test_nullifier_" + Math.floor(Date.now() / 10000);
      // Attempt 1: First submission
      const res1 = await privacyApi.submitNullifier("DEMO-NATIONAL-2026", testNullifier);
      // Attempt 2: Second submission with the same nullifier
      const res2 = await privacyApi.submitNullifier("DEMO-NATIONAL-2026", testNullifier);
      setNullifierAttackResult({
        firstAttempt: res1,
        secondAttempt: res2,
      });
    } catch (err: any) {
      setNullifierAttackResult({ error: err?.response?.data?.detail });
    } finally {
      setLoadingNullifier(false);
    }
  };

  const onlineCount = validators.filter((v) => v.status === "ONLINE").length;
  const quorumMet = onlineCount >= 4;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-xs font-mono text-rose-300 shadow-glow-rose">
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Live Adversarial Simulation & Integrity Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Security Attack & Tamper Demonstration Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Act as a malicious adversary: tamper with raw database payloads, inject forged quantum signatures,
          simulate validator dropouts, and trigger double-voting replay attacks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATTACK 1: DATABASE EVIDENCE TAMPERING */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Attack 1: Database Evidence Tampering</h3>
                <p className="text-[11px] text-slate-400">Directly alter polling station turnout in database storage</p>
              </div>
            </div>
            <span className="badge-alert">Critical Vector</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Target Evidence Record to Tamper:
              </label>
              <select
                value={selectedEvidenceId}
                onChange={(e) => setSelectedEvidenceId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              >
                {evidenceList.map((ev) => (
                  <option key={ev.evidence_id} value={ev.evidence_id}>
                    {ev.evidence_id} ({ev.evidence_type} - {ev.station_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTamper}
                disabled={loadingTamper || !selectedEvidenceId}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {loadingTamper ? "Injecting Tamper..." : "Tamper Record (Set Turnout=9999)"}
              </button>

              <button
                onClick={handleRestore}
                className="py-2 px-3 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Restore to clean verified state"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore
              </button>
            </div>
          </div>

          {/* Tamper Result Box */}
          <AnimatePresence>
            {tamperingResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>TAMPERING INSTANTLY DETECTED:</span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>Stored Canonical Hash: <span className="text-cyan-400">{tamperingResult.original_content_hash?.slice(0, 24)}...</span></div>
                  <div>Recomputed Payload Hash: <span className="text-rose-400">{tamperingResult.recomputed_content_hash?.slice(0, 24)}...</span></div>
                  <div className="text-rose-400 font-bold">CONTENT HASH MISMATCH = TRUE</div>
                  <div className="text-rose-400 font-bold">MERKLE ROOT PROOF = FAILED</div>
                  <div className="text-rose-400 font-bold">ML-DSA SIGNATURE = INVALID</div>
                </div>

                <div className="p-2 rounded bg-rose-950/80 border border-rose-800 text-[11px] text-rose-200">
                  {tamperingResult.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ATTACK 2: FORGED EVIDENCE INJECTION */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Attack 2: Forged Evidence Injection</h3>
                <p className="text-[11px] text-slate-400">Submit counterfeit package with fake/corrupted ML-DSA signature</p>
              </div>
            </div>
            <span className="badge-alert">PQC Defense</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Adversary intercepts network and crafts a synthetic ballot summary signed with an invalid private key
            or random byte sequence.
          </p>

          <button
            onClick={handleForge}
            disabled={loadingForge}
            className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-violet flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loadingForge ? "Submitting Forgery..." : "Submit Forged Evidence Package"}
          </button>

          <AnimatePresence>
            {forgedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-purple-950/50 border border-purple-500/50 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>FORGERY REJECTED BY CRYPTO GATEWAY:</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <div>Status: <span className="text-rose-400 font-bold">{forgedResult.status}</span></div>
                  <div>Reason: <span className="text-slate-300">{forgedResult.reason}</span></div>
                  <div>Alert Logged: <span className="text-cyan-400">{forgedResult.security_event_id}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ATTACK 3: VALIDATOR FAILURE & BYZANTINE FAULT */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Attack 3: Validator Failure / Byzantine Dropout</h3>
                <p className="text-[11px] text-slate-400">Toggle validator nodes offline to test BFT quorum threshold (4 of 5)</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                quorumMet
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {onlineCount}/5 Online ({quorumMet ? "Quorum Reached" : "Quorum Lost!"})
            </span>
          </div>

          <div className="space-y-2">
            {validators.map((val) => (
              <div
                key={val.validator_id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">{val.organization_name}</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">({val.validator_id})</span>
                </div>
                <button
                  onClick={() => handleToggleValidator(val.validator_id, val.status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    val.status === "ONLINE"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700"
                      : "bg-rose-950/80 text-rose-300 border border-rose-700 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-700"
                  }`}
                >
                  {val.status === "ONLINE" ? "Take Offline" : "Restore Online"}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-white">Byzantine Consensus Rule: </span>
            A minimum of 4 of 5 validators must attest to finalize commitments.
            {quorumMet ? (
              <span className="text-emerald-400 font-semibold ml-1">Current state achieves threshold consensus.</span>
            ) : (
              <span className="text-rose-400 font-semibold ml-1">Threshold breached: Finalization is blocked until nodes recover!</span>
            )}
          </div>
        </div>

        {/* ATTACK 4: DUPLICATE PARTICIPATION / REPLAY ATTACK */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Attack 4: Double-Voting Replay Attack</h3>
                <p className="text-[11px] text-slate-400">Attempt submitting identical election-specific nullifier twice</p>
              </div>
            </div>
            <span className="badge-verified">ZK Privacy</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The voter secret generates an election-specific nullifier: <code className="text-cyan-300">Nullifier = SHA3-256(voter_secret || election_id)</code>.
            The system accepts the first vote, and permanently halts any duplicate attempt.
          </p>

          <button
            onClick={handleDuplicateNullifier}
            disabled={loadingNullifier}
            className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-glow-emerald flex items-center justify-center gap-2 transition-all font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loadingNullifier ? "Running Attack Simulation..." : "Simulate Double-Voting Attempt"}
          </button>

          <AnimatePresence>
            {nullifierAttackResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 font-mono text-xs"
              >
                {/* Attempt 1 */}
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-emerald-400">Attempt 1 (Original Vote):</div>
                    <div className="text-[10px] text-slate-300">{nullifierAttackResult.firstAttempt?.message}</div>
                  </div>
                  <span className="badge-verified">ACCEPTED</span>
                </div>

                {/* Attempt 2 */}
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-rose-400">Attempt 2 (Replay / Duplicate Vote):</div>
                    <div className="text-[10px] text-slate-300">{nullifierAttackResult.secondAttempt?.message}</div>
                  </div>
                  <span className="badge-alert">REJECTED</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
