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
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#18B368]/20 bg-white shadow-[0_8px_30px_rgba(10,17,52,0.05)] sm:mb-8 sm:rounded-3xl">
      <div className="h-1 w-full bg-gradient-to-r from-[#18B368] via-[#2dd4a0] to-[#0A1134]" />
      <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-stretch lg:justify-between lg:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#18B368]">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-[-0.03em] text-[#0A1134] sm:text-3xl lg:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px] sm:leading-7">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-[#18B368]/20 bg-[#18B368]/10 px-4 py-3 sm:min-w-[260px] lg:flex-col lg:items-stretch lg:justify-center lg:px-5 lg:py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CalendarDays size={16} className="text-[#18B368]" />
              <span className="truncate">{date}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Clock3 size={16} className="text-[#18B368]" />
              <span className="text-xl font-medium tabular-nums tracking-tight text-[#0A1134] sm:text-2xl">
                {time}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <ShieldCheck size={16} className="text-[#18B368]" />
              <div>
                <p className="text-xs font-medium tracking-tight text-[#0A1134]">Live operations</p>
                <p className="text-[11px] text-slate-500">Figures come from the database</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print this dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#18B368]/25 bg-white text-slate-600 transition hover:border-[#18B368] hover:bg-[#18B368] hover:text-white"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
