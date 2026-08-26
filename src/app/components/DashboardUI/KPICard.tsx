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
    pink: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100" },
    blue: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-100" },
    yellow: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
    red: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
    purple: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-100" },
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {title}
        </p>
        {icon ? (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${colors[color].bg} ${colors[color].text} ${colors[color].ring}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.7rem]">
        {value}
      </p>
      {subtitle ? (
        <p className={`mt-1.5 text-xs font-medium ${colors[color].text}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
