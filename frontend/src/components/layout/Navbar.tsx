import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Cpu, Activity, Sparkles, UserCheck, ChevronDown, Radio } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { Role } from "../../types";

export const Navbar: React.FC = () => {
  const { role, switchRole, user } = useAuth();
  const { isConnected } = useWebSocket();
  const navigate = useNavigate();

  const roles: { key: Role; label: string; color: string }[] = [
    { key: "SUPER_ADMIN", label: "Super Admin", color: "text-purple-400" },
    { key: "ELECTION_AUTHORITY", label: "Election Authority", color: "text-cyan-400" },
    { key: "VALIDATOR", label: "Validator Node", color: "text-blue-400" },
    { key: "AUDITOR", label: "Independent Auditor", color: "text-emerald-400" },
    { key: "CITIZEN", label: "Public Citizen", color: "text-amber-400" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[1px] shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-white">
                  Q<span className="text-cyan-400">-AUDIT</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  PQC v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quantum-Resilient Election Verification Network
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Core Tagline */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>"Don't decentralize the vote. Decentralize the trust."</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-rose-400"}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {isConnected ? "LIVE NETWORK" : "CONNECTING"}
            </span>
          </div>

          {/* Guided Demo Launch Button */}
          <button
            onClick={() => navigate("/demo")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Killer</span> Demo Mode
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-medium text-slate-200 transition-all">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline font-mono">Role:</span>
              <span className="font-semibold text-cyan-300">
                {roles.find((r) => r.key === role)?.label || role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-52 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                Switch Demo Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => switchRole(r.key)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 transition-colors ${
                    role === r.key ? "bg-cyan-950/40 text-cyan-300 font-semibold" : "text-slate-300"
                  }`}
                >
                  <span>{r.label}</span>
                  {role === r.key && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
