import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Vote,
  FileText,
  KeyRound,
  GitFork,
  Radio,
  SearchCheck,
  EyeOff,
  Flame,
  ShieldAlert,
  Binary,
  Code2,
  Info,
  Server
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const navSections = [
    {
      title: "Core Verification",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/demo", label: "Hackathon Demo Mode", icon: Sparkles, highlight: true },
        { to: "/verify", label: "Public Verification Portal", icon: SearchCheck, badge: "Flagship" },
      ],
    },
    {
      title: "Election Lifecycle",
      items: [
        { to: "/elections", label: "Elections List", icon: Vote },
        ...(role === "SUPER_ADMIN" || role === "ELECTION_AUTHORITY"
          ? [{ to: "/elections/new", label: "Create Election", icon: KeyRound }]
          : []),
        { to: "/evidence", label: "Evidence Records", icon: FileText },
      ],
    },
    {
      title: "Post-Quantum & Merkle",
      items: [
        { to: "/merkle", label: "Merkle Tree Proofs", icon: GitFork },
        { to: "/audits", label: "QRNG Audit System", icon: Radio },
        { to: "/validators", label: "Validator Network (BFT)", icon: Server },
      ],
    },
    {
      title: "Zero-Knowledge & Privacy",
      items: [
        { to: "/privacy", label: "ZK Eligibility & Nullifiers", icon: EyeOff },
      ],
    },
    {
      title: "Cybersecurity & Attack Lab",
      items: [
        { to: "/attack-lab", label: "Attack Simulation Lab", icon: Flame, badge: "Live Attack" },
        { to: "/security", label: "Security & Alerts Monitor", icon: ShieldAlert },
      ],
    },
    {
      title: "Architecture & Standards",
      items: [
        { to: "/architecture", label: "System Architecture", icon: Binary },
        { to: "/api-docs", label: "Developer & PQC Specs", icon: Code2 },
        { to: "/about", label: "About Q-Audit", icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#070b14]/70 border-r border-slate-800/80 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-2 px-2">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      } ${item.highlight ? "text-cyan-400 font-semibold" : ""}`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.highlight ? "text-cyan-400 animate-pulse" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Protocol Badge Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 text-[10px] text-slate-400 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>ALGORITHM</span>
          <span className="text-cyan-300">ML-DSA-44</span>
        </div>
        <div className="flex items-center justify-between">
          <span>HASH</span>
          <span className="text-slate-300">SHA3-256</span>
        </div>
        <div className="flex items-center justify-between">
          <span>CONSENSUS</span>
          <span className="text-emerald-300">4/5 BFT</span>
        </div>
      </div>
    </aside>
  );
};
