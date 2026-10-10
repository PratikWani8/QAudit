import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, Plus, Trash2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { electionsApi } from "../services/api";

export const CreateElectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [electionId, setElectionId] = useState(`ELEC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  const [candidates, setCandidates] = useState<Array<{ id: string; name: string; party: string }>>([
    { id: "CAN-01", name: "", party: "" },
    { id: "CAN-02", name: "", party: "" }
  ]);

  const [stations, setStations] = useState<Array<{ id: string; deviceCommitment: string }>>([
    { id: "STATION-001", deviceCommitment: "EVM-DEVICE-FIPS204-1001" },
    { id: "STATION-002", deviceCommitment: "EVM-DEVICE-FIPS204-1002" }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCandidate = () => {
    const nextId = `CAN-0${candidates.length + 1}`;
    setCandidates([...candidates, { id: nextId, name: "", party: "" }]);
  };

  const removeCandidate = (idx: number) => {
    if (candidates.length <= 1) return;
    setCandidates(candidates.filter((_, i) => i !== idx));
  };

  const addStation = () => {
    const nextNum = stations.length + 1;
    const nextId = `STATION-${nextNum < 10 ? '00' : '0'}${nextNum}`;
    setStations([...stations, { id: nextId, deviceCommitment: `EVM-DEVICE-FIPS204-${1000 + nextNum}` }]);
  };

  const removeStation = (idx: number) => {
    if (stations.length <= 1) return;
    setStations(stations.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !jurisdiction) {
      setError("Please fill in election name and jurisdiction");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        election_id: electionId,
        name,
        jurisdiction,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        candidates: candidates.map((c, idx) => ({
          candidate_id: c.id,
          public_metadata: { name: c.name || `Candidate ${c.id}`, party: c.party || "Independent", ballot_index: idx + 1 }
        })),
        polling_stations: stations.map((s) => ({
          station_id: s.id,
          device_commitment: s.deviceCommitment
        }))
      };

      await electionsApi.create(payload);
      // Auto lock configuration
      await electionsApi.lock(electionId);
      navigate("/elections");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Vote className="w-6 h-6 text-cyan-400" />
          Initialize Election Audit Envelope
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Establish cryptographic parameters, register polling stations, and execute ML-DSA configuration lock ceremony.
        </p>
      </div>

      {/* Protocol Ceremony Flow Graphic */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-center">
        <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-2 font-bold">
          Cryptographic Locking Ceremony Pipeline:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300">
          <span className="p-1.5 rounded bg-slate-900 border border-slate-800">CONFIGURATION</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-1.5 rounded bg-slate-900 border border-slate-800">CANONICAL JSON</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-1.5 rounded bg-slate-900 border border-slate-800">SHA3-256 HASH</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-1.5 rounded bg-slate-900 border border-slate-800">ML-DSA SIGNATURE</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="p-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">LOCKED</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* General Details */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">1. Basic Election Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Election Identifier</label>
              <input
                type="text"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Jurisdiction / District</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. National Capital Region"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Official Election Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Parliamentary General Election 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Poll Start Timestamp</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Poll End Timestamp</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Candidates List Builder */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">2. Registered Candidates</h3>
            <button
              type="button"
              onClick={addCandidate}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Candidate
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={c.id}
                  disabled
                  className="w-24 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Candidate Full Name"
                  value={c.name}
                  onChange={(e) => {
                    const list = [...candidates];
                    list[idx].name = e.target.value;
                    setCandidates(list);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Party / Affiliation"
                  value={c.party}
                  onChange={(e) => {
                    const list = [...candidates];
                    list[idx].party = e.target.value;
                    setCandidates(list);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => removeCandidate(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Polling Stations Builder */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">3. Polling Stations & Hardware Commitments</h3>
            <button
              type="button"
              onClick={addStation}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Station
            </button>
          </div>

          <div className="space-y-3">
            {stations.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={s.id}
                  disabled
                  className="w-32 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Hardware/Firmware Device Commitment"
                  value={s.deviceCommitment}
                  onChange={(e) => {
                    const list = [...stations];
                    list[idx].deviceCommitment = e.target.value;
                    setStations(list);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => removeStation(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan flex items-center justify-center gap-2 transition-all font-mono"
        >
          <Lock className="w-4 h-4" />
          {loading ? "Canonicalizing & Signing with ML-DSA..." : "Create Election & Execute ML-DSA Lock"}
        </button>
      </form>
    </div>
  );
};
