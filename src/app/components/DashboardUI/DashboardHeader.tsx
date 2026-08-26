"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Printer, ShieldCheck } from "lucide-react";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");
      setDate(
        new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)
      );
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ops-glow group mb-6 overflow-hidden rounded-2xl border border-emerald-100/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mb-8 sm:rounded-[28px]">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />
      <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-stretch lg:justify-between lg:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
            {greeting}
          </p>
          <h1 className="mt-1 bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-800 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl lg:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px] sm:leading-7">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:min-w-[260px] lg:flex-col lg:items-stretch lg:justify-center lg:px-5 lg:py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CalendarDays size={16} className="text-emerald-600" />
              <span className="truncate">{date}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Clock3 size={16} className="text-emerald-600" />
              <span className="text-xl font-black tabular-nums tracking-tight text-slate-950 sm:text-2xl">
                {time}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.28)]">
                <span className="ops-live-dot absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-800">Live operations</p>
                <p className="text-[11px] text-slate-500">Figures come from the database</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print this dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
