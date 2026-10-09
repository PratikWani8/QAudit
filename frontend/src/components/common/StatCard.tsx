import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "cyan" | "violet" | "blue" | "emerald" | "rose" | "amber";
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "cyan",
  trend,
}) => {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20 hover:border-cyan-500/50 hover:shadow-glow-cyan",
    violet: "text-violet-400 border-violet-500/20 bg-violet-950/20 hover:border-violet-500/50 hover:shadow-glow-violet",
    blue: "text-blue-400 border-blue-500/20 bg-blue-950/20 hover:border-blue-500/50 hover:shadow-glow-blue",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/50 hover:shadow-glow-emerald",
    rose: "text-rose-400 border-rose-500/20 bg-rose-950/20 hover:border-rose-500/50 hover:shadow-glow-rose",
    amber: "text-amber-400 border-amber-500/20 bg-amber-950/20 hover:border-amber-500/50",
  };

  const iconColor = {
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 border transition-all duration-300 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-900/80 border border-slate-800 ${iconColor[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-[11px] font-mono text-cyan-400">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
  );
};
