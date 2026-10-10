import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Flame, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { securityApi } from "../services/api";
import { SecurityEvent } from "../types";

export const SecurityDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await securityApi.getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Cybersecurity Incident & Tampering Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs and cryptographic attack interceptions recorded across the election network.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-slate-300 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} /> Refresh
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Recorded Incident Stream ({events.length} Interceptions)
        </div>

        {events.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-12">No security incidents recorded. System secure.</div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.event_id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-rose-400 font-bold">{ev.event_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {ev.event_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ev.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {ev.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ev.detected_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(ev.details, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
