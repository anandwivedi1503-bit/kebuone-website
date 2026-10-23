"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut, RefreshCcw, Sparkles } from "lucide-react";

import { openOpsEva } from "@/lib/opsFocus";

type PulseStat = { label: string; value: string; dashboard?: string };

export default function OpsCommandBar({
  onOpenDashboard,
  onRefresh,
}: {
  onOpenDashboard: (dashboard: string) => void;
  onRefresh: () => void;
  homeDashboard?: string;
}) {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<PulseStat[]>([]);

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
    openOpsEva(query.trim());
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
    <div className="no-print mb-5 overflow-hidden rounded-2xl border border-[#18B368]/20 bg-[#0B1B16] text-white shadow-[0_16px_50px_rgba(10,17,52,0.16)]">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Sparkles
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6EE7A8]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Ops Eva: unpaid, KYC, a phone, BK- id, ticket…"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/10 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#18B368]"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#18B368] px-4 text-sm font-semibold text-white"
          >
            Ask Eva
          </button>
        </form>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-[#0B1B16]"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>
      {stats.length ? (
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-2">
          {stats.slice(0, 8).map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => {
                if (stat.dashboard) onOpenDashboard(stat.dashboard);
                else openOpsEva(stat.label);
              }}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#D1FAE5]"
            >
              {stat.label} · {stat.value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
