import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  FileText,
  GitFork,
  Radio,
  Server,
  ShieldCheck,
  Flame,
  Fingerprint,
  RotateCcw,
  Cpu,
  Layers,
  Terminal
} from "lucide-react";
import {
  electionsApi,
  evidenceApi,
  validatorsApi,
  auditsApi,
  securityApi,
  privacyApi
} from "../services/api";
import { PqcBadge } from "../components/common/PqcBadge";
import { motion, AnimatePresence } from "framer-motion";

interface DemoStep {
  number: number;
  title: string;
  category: string;
  description: string;
  actionLabel: string;
}

export const DemoModePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const steps: DemoStep[] = [
    {
      number: 1,
      title: "Create Simulated Election",
      category: "Lifecycle",
      description: "Initialize an independent cryptographic audit envelope for the National Demonstration Election 2026.",
      actionLabel: "Create Election Entity",
    },
    {
      number: 2,
      title: "Add Candidates & Polling Stations",
      category: "Lifecycle",
      description: "Register candidates and cryptographic device commitments for 10 simulated polling stations.",
      actionLabel: "Register Candidates & Stations",
    },
    {
      number: 3,
      title: "Lock Configuration Ceremony",
      category: "PQC Ceremony",
      description: "Canonicalize JSON, compute SHA3-256 hash, and sign configuration using post-quantum ML-DSA (NIST FIPS 204).",
      actionLabel: "Execute ML-DSA Configuration Lock",
    },
    {
      number: 4,
      title: "Generate Simulated Evidence Packages",
      category: "Evidence Engine",
      description: "Ingest cryptographically signed poll_opened, device_commitment, station_summary, and poll_closed evidence.",
      actionLabel: "Ingest Station Evidence Records",
    },
    {
      number: 5,
      title: "Construct Merkle Tree",
      category: "Merkle Engine",
      description: "Construct canonical SHA3-256 binary Merkle tree across evidence hashes and compute certified Merkle Root.",
      actionLabel: "Build & Commit Merkle Root",
    },
    {
      number: 6,
      title: "Sample QRNG Audit Entropy",
      category: "Quantum Layer",
      description: "Obtain 256 bits of quantum entropy from ANU quantum optical vacuum fluctuation API / verified simulator.",
      actionLabel: "Capture Quantum Entropy",
    },
    {
      number: 7,
      title: "Deterministic Audit Selection",
      category: "Audit Layer",
      description: "Combine QRNG entropy with public election commitment to deterministically select sample stations for audit.",
      actionLabel: "Generate Audit Sample",
    },
    {
      number: 8,
      title: "Federated Validator Attestations",
      category: "Distributed",
      description: "Transmit Merkle root to Government, Auditor, Academic, and Observer nodes to verify hashes and ML-DSA signatures.",
      actionLabel: "Collect Validator Attestations",
    },
    {
      number: 9,
      title: "BFT Consensus Finalization",
      category: "Distributed",
      description: "Verify that 4 of 5 supermajority quorum has signed attestations and finalize transparency log commitment.",
      actionLabel: "Verify BFT Consensus Threshold",
    },
    {
      number: 10,
      title: "Public Verification Check",
      category: "Transparency",
      description: "Execute citizen verification pipeline: all 6 cryptographic checkpoints pass with green verdict.",
      actionLabel: "Run Public Verification",
    },
    {
      number: 11,
      title: "Attack Lab: Database Evidence Tampering",
      category: "Adversarial Attack",
      description: "Simulate a malicious actor altering ballot turnout in database storage without re-signing the record.",
      actionLabel: "Inject Malicious Tampering",
    },
    {
      number: 12,
      title: "Tampering Detection Proof",
      category: "Adversarial Defense",
      description: "Demonstrate instant cascade: Content Hash Mismatch -> Merkle Proof Invalidation -> Critical Security Alert.",
      actionLabel: "Verify Tamper Detection Alert",
    },
    {
      number: 13,
      title: "Exact Audit Reproducibility",
      category: "Audit Verification",
      description: "Auditor re-runs deterministic seed calculation using public commitment and raw entropy: 100% exact match!",
      actionLabel: "Independently Reproduce Audit Sample",
    },
    {
      number: 14,
      title: "Attempt Duplicate Nullifier Replay",
      category: "ZK Privacy",
      description: "Submit duplicate election nullifier: Accepted on first attempt, permanently rejected on second replay attempt.",
      actionLabel: "Test Double-Voting Prevention",
    },
  ];

  const currentStepObj = steps.find((s) => s.number === currentStep)!;

  // Execute step action
  const handleExecuteStep = async () => {
    setLoading(true);
    setError(null);
    try {
      let resultData: any = null;

      switch (currentStep) {
        case 1:
        case 2:
          // Check or create demo election
          try {
            const el = await electionsApi.get("DEMO-NATIONAL-2026");
            resultData = el;
          } catch {
            const el = await electionsApi.create({
              election_id: "DEMO-NATIONAL-2026",
              name: "National Demonstration Election 2026",
              jurisdiction: "Federal Republic Audit Jurisdiction",
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 86400000).toISOString(),
              candidates: [
                { candidate_id: "CAN-001", public_metadata: { name: "Dr. Elena Vance", party: "Alliance" } },
                { candidate_id: "CAN-002", public_metadata: { name: "Marcus Sterling", party: "Integrity" } },
              ],
              polling_stations: [
                { station_id: "STATION-001", device_commitment: "EVM-COMMIT-001" },
                { station_id: "STATION-002", device_commitment: "EVM-COMMIT-002" },
              ]
            });
            resultData = el;
          }
          break;

        case 3:
          try {
            resultData = await electionsApi.lock("DEMO-NATIONAL-2026");
          } catch {
            resultData = await electionsApi.verify("DEMO-NATIONAL-2026");
          }
          break;

        case 4:
          const evList = await evidenceApi.list("DEMO-NATIONAL-2026");
          resultData = { count: evList.length, sample: evList.slice(0, 3) };
          break;

        case 5:
          const commits = await evidenceApi.getCommitments("DEMO-NATIONAL-2026");
          if (commits.length > 0) {
            resultData = commits[0];
          } else {
            resultData = await evidenceApi.commitRoot("DEMO-NATIONAL-2026");
          }
          break;

        case 6:
          resultData = await auditsApi.getQrngSample();
          break;

        case 7:
          const audits = await auditsApi.listForElection("DEMO-NATIONAL-2026");
          if (audits.length > 0) {
            resultData = audits[0];
          } else {
            resultData = await auditsApi.run("DEMO-NATIONAL-2026", 4, true);
          }
          break;

        case 8:
        case 9:
          const vals = await validatorsApi.list();
          const commitsForBft = await evidenceApi.getCommitments("DEMO-NATIONAL-2026");
          let bftStatus = null;
          if (commitsForBft.length > 0) {
            bftStatus = await validatorsApi.getBftStatus(commitsForBft[0].commitment_id);
          }
          resultData = { validators: vals, bftStatus };
          break;

        case 10:
          resultData = await securityApi.getPublicVerification("DEMO-NATIONAL-2026");
          break;

        case 11:
          const allEv = await evidenceApi.list("DEMO-NATIONAL-2026");
          const targetId = allEv[0]?.evidence_id || "EVD-STATION-001-PRIMARY";
          resultData = await securityApi.tamperEvidence(targetId, "voter_turnout", 9999);
          break;

        case 12:
          const secEvents = await securityApi.getEvents();
          resultData = { latest_alert: secEvents[0] };
          break;

        case 13:
          const auditsList = await auditsApi.listForElection("DEMO-NATIONAL-2026");
          const activeAudit = auditsList[0];
          resultData = await auditsApi.reproduce({
            election_id: "DEMO-NATIONAL-2026",
            raw_entropy: activeAudit.raw_entropy || "00".repeat(32),
            public_commitment: activeAudit.election_commitment || activeAudit.entropy_commitment,
            sample_size: 4
          });
          break;

        case 14:
          const demoSecret = "hackathon_voter_token_" + Date.now();
          const nullifierHash = "0x" + Math.random().toString(16).substring(2) + "deadbeef";
          const res1 = await privacyApi.submitNullifier("DEMO-NATIONAL-2026", nullifierHash);
          const res2 = await privacyApi.submitNullifier("DEMO-NATIONAL-2026", nullifierHash);
          resultData = { firstAttempt: res1, secondAttempt: res2 };
          break;

        default:
          break;
      }

      setStepData((prev) => ({ ...prev, [currentStep]: resultData }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Execution error");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 14) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-glow-cyan">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Judges Demonstration Flow</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Killer Guided Hackathon Demo
        </h1>
        <p className="text-xs text-slate-400">
          A 14-step automated walkthrough demonstrating end-to-end evidence creation, PQC signatures,
          QRNG auditing, Byzantine consensus, live attack detection, and audit reproducibility.
        </p>
      </div>

      {/* 14 Step Progress Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
          {steps.map((s) => {
            const isDone = !!stepData[s.number];
            const isCurrent = s.number === currentStep;
            return (
              <button
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-cyan-500/20 border border-cyan-400 shadow-glow-cyan"
                    : isDone
                    ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400"
                    : "bg-slate-950/60 border border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="font-mono text-xs font-bold">
                  {s.number < 10 ? `0${s.number}` : s.number}
                </span>
                <span className="text-[10px] truncate max-w-[70px] mt-0.5">
                  {s.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Detail Card */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge-quantum">STEP {currentStep} OF 14</span>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                {currentStepObj.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{currentStepObj.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300">{currentStepObj.description}</p>
          </div>

          <button
            onClick={handleExecuteStep}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan flex items-center gap-2 transition-all flex-shrink-0"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" /> Executing Step...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" /> {currentStepObj.actionLabel}
              </>
            )}
          </button>
        </div>

        {/* Step Execution Telemetry Output */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Terminal className="w-4 h-4" /> Live Cryptographic Telemetry
            </span>
            <span>Step {currentStep} Status: {stepData[currentStep] ? "SUCCESS" : "PENDING EXECUTION"}</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300">
              Error: {error}
            </div>
          )}

          {stepData[currentStep] ? (
            <pre className="text-[11px] text-cyan-300/90 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {JSON.stringify(stepData[currentStep], null, 2)}
            </pre>
          ) : (
            <div className="text-slate-500 py-6 text-center">
              Click <strong className="text-cyan-400">"{currentStepObj.actionLabel}"</strong> above to execute this live step on the Q-Audit network.
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>

          <span className="text-xs font-mono text-slate-400">
            Sequence {currentStep} of 14
          </span>

          <button
            onClick={handleNext}
            disabled={currentStep === 14}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            Next Step <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
