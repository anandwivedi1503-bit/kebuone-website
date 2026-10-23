"use client";

import { FormEvent, useEffect, useState } from "react";
import { Command, LogOut, RefreshCcw, Search } from "lucide-react";

import { openOpsDesk } from "@/lib/opsFocus";

type PulseStat = { label: string; value: string; dashboard?: string };

export default function OpsCommandBar({
  onOpenDashboard,
  onRefresh,
  homeDashboard = "admin",
}: {
  onOpenDashboard: (dashboard: string) => void;
  onRefresh: () => void;
  homeDashboard?: string;
}) {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<PulseStat[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const field = document.querySelector<HTMLInputElement>("[data-ops-search]");
        field?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/ops-assistant/pulse", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) setStats(data.stats || []);
      } catch {
        // Pulse is optional chrome.
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 20000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const asked = query.trim();
    if (asked.length < 2) {
      setMessage("Type a booking, phone, vehicle or ticket.");
      return;
    }
    setMessage("");
    openOpsDesk(homeDashboard, asked);
    onOpenDashboard(homeDashboard);
  };

  const logout = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST", credentials: "include" });
    } catch {
      // Fall through to login.
    }
    window.location.href = "/admin-login";
  };

  return (
    <div className="no-print mb-5 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_16px_50px_rgba(10,17,52,0.08)] backdrop-blur-md">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-ops-search
              placeholder="Search bookings, riders, tickets, vehicles"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-12 text-sm outline-none focus:border-[#18B368] focus:bg-white"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-flex">
              <Command size={10} /> K
            </span>
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#0B1B16] px-4 text-sm font-semibold text-white"
          >
            Jump
          </button>
        </form>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-[#18B368]"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#18B368] px-3 text-sm font-semibold text-white"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>
      {stats.length ? (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2">
          {stats.slice(0, 6).map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => stat.dashboard && onOpenDashboard(stat.dashboard)}
              className="shrink-0 rounded-full bg-[#F4FFF8] px-3 py-1.5 text-xs font-semibold text-[#0B1B16]"
            >
              {stat.label} · {stat.value}
            </button>
          ))}
        </div>
      ) : null}
      {message ? <p className="px-3 pb-2 text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
