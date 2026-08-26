"use client";

import { ReactNode } from "react";

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "pink" | "green" | "blue" | "yellow" | "red" | "purple";
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: KPICardProps) {
  const colors = {
    pink: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      glow: "hover:shadow-[0_16px_40px_rgba(244,63,94,0.22)] hover:border-rose-200",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      glow: "hover:shadow-[0_16px_40px_rgba(16,185,129,0.28)] hover:border-emerald-200",
    },
    blue: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      glow: "hover:shadow-[0_16px_40px_rgba(14,165,233,0.24)] hover:border-sky-200",
    },
    yellow: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      glow: "hover:shadow-[0_16px_40px_rgba(245,158,11,0.24)] hover:border-amber-200",
    },
    red: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      glow: "hover:shadow-[0_16px_40px_rgba(225,29,72,0.24)] hover:border-rose-200",
    },
    purple: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      glow: "hover:shadow-[0_16px_40px_rgba(139,92,246,0.24)] hover:border-violet-200",
    },
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 sm:p-5 ${colors[color].glow}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current opacity-[0.06] transition group-hover:opacity-20" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        {icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color].bg} ${colors[color].text} shadow-sm transition duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-[1.75rem]">
        {value}
      </p>
      {subtitle ? (
        <p className={`mt-1.5 text-xs font-semibold ${colors[color].text}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
