import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Vote, Plus, Lock, CheckCircle2, Shield, Calendar, MapPin, ExternalLink } from "lucide-react";
import { electionsApi } from "../services/api";
import { Election } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { PqcBadge } from "../components/common/PqcBadge";

export const ElectionsPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { role } = useAuth();
  const navigate = useNavigate();

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await electionsApi.list();
      setElections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  const handleLock = async (electionId: string) => {
    try {
      await electionsApi.lock(electionId);
      await loadElections();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-cyan-400" />
            Election Audit Envelopes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered election configurations locked with post-quantum ML-DSA digital signatures.
          </p>
        </div>

        {(role === "SUPER_ADMIN" || role === "ELECTION_AUTHORITY") && (
          <Link
            to="/elections/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" /> Create Election
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 text-center py-12">Loading election records...</div>
      ) : elections.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-800">
          <p className="text-sm text-slate-400">No elections found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((el) => (
            <div
              key={el.election_id}
              className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {el.election_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        el.status === "LOCKED" || el.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {el.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{el.name}</h3>
                </div>

                <button
                  onClick={() => navigate(`/verify?election_id=${el.election_id}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  Verify <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jurisdiction: <strong className="text-white">{el.jurisdiction}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {new Date(el.start_time).toLocaleDateString()} — {new Date(el.end_time).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {el.configuration_hash && (
                <div className="space-y-1 pt-2 border-t border-slate-900 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">Configuration SHA3-256 Hash:</div>
                  <div className="code-badge">{el.configuration_hash}</div>
                </div>
              )}

              {el.signature ? (
                <PqcBadge
                  algorithm="ML-DSA-44 (FIPS 204)"
                  signature={el.signature}
                  keyId={el.signing_key_id || "ELECTION-AUTHORITY-KEY-01"}
                />
              ) : el.status === "DRAFT" && (role === "SUPER_ADMIN" || role === "ELECTION_AUTHORITY") ? (
                <button
                  onClick={() => handleLock(el.election_id)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" /> Execute ML-DSA Locking Ceremony
                </button>
              ) : null}

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-900">
                <span>{el.candidates?.length || 0} Candidates</span>
                <span>•</span>
                <span>{el.polling_stations?.length || 0} Polling Stations</span>
                <Link
                  to={`/evidence?election_id=${el.election_id}`}
                  className="text-cyan-400 hover:underline"
                >
                  View Evidence →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
