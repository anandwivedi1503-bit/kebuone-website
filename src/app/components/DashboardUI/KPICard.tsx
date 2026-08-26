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
      bar: "bg-rose-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
      hover: "hover:border-rose-200 hover:shadow-[0_12px_28px_rgba(244,63,94,0.16)]",
    },
    green: {
      bar: "bg-[#18B368]",
      bg: "bg-emerald-50",
      text: "text-[#148a52]",
      hover: "hover:border-[#18B368]/40 hover:shadow-[0_12px_28px_rgba(24,179,104,0.18)]",
    },
    blue: {
      bar: "bg-sky-500",
      bg: "bg-sky-50",
      text: "text-sky-700",
      hover: "hover:border-sky-200 hover:shadow-[0_12px_28px_rgba(14,165,233,0.16)]",
    },
    yellow: {
      bar: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      hover: "hover:border-amber-200 hover:shadow-[0_12px_28px_rgba(245,158,11,0.16)]",
    },
    red: {
      bar: "bg-rose-600",
      bg: "bg-rose-50",
      text: "text-rose-700",
      hover: "hover:border-rose-200 hover:shadow-[0_12px_28px_rgba(225,29,72,0.16)]",
    },
    purple: {
      bar: "bg-violet-500",
      bg: "bg-violet-50",
      text: "text-violet-700",
      hover: "hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(139,92,246,0.16)]",
    },
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(10,17,52,0.04)] transition duration-200 hover:-translate-y-0.5 sm:p-5 ${colors[color].hover}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${colors[color].bar}`} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
        {icon ? (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[color].bg} ${colors[color].text} transition duration-200 group-hover:scale-105`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 break-words pl-2 text-2xl font-medium tabular-nums tracking-[-0.03em] text-[#0A1134] sm:text-[1.7rem]">
        {value}
      </p>
      {subtitle ? (
        <p className={`mt-1.5 pl-2 text-xs font-medium ${colors[color].text}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
