"use client";

import { FormEvent, useEffect, useState } from "react";
import { RefreshCcw, Search, Sparkles } from "lucide-react";

import { openOpsDesk, openOpsEva } from "@/lib/opsFocus";

type PulseStat = { label: string; value: string; dashboard?: string };
type Hit = {
  kind?: string;
  id?: string;
  title?: string;
  detail?: string;
  dashboard?: string;
};

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
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch("/api/ops-assistant", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, language: "auto" }),
        });
        const data = await res.json();
        if (!cancelled && data.success) setHits((data.hits || []).slice(0, 6));
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    openOpsEva(query.trim());
  };

  const openHit = (hit: Hit) => {
    if (hit.dashboard) openOpsDesk(hit.dashboard, String(hit.id || query));
    else openOpsEva(String(hit.id || hit.title || query));
    setHits([]);
  };

  return (
    <div className="no-print mb-5 overflow-hidden rounded-2xl border border-[#E4DDD2] bg-white/90 shadow-[0_12px_40px_rgba(28,25,23,0.06)] backdrop-blur-sm">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <form onSubmit={submit} className="relative flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Sparkles
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1F6B4A]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search live ops: phone, BK- id, rider, unpaid, KYC, refund…"
              className="h-11 w-full rounded-xl border border-[#E6EBE7] bg-[#F7F4EE]/60 pl-9 pr-4 text-sm text-[#1C1917] outline-none placeholder:text-[#9AA39C] focus:border-[#1F6B4A] focus:ring-4 focus:ring-[#1F6B4A]/10"
            />
            {hits.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-[#E4DDD2] bg-white shadow-xl">
                {hits.map((hit, index) => (
                  <button
                    key={`${hit.kind}-${hit.id}-${index}`}
                    type="button"
                    onClick={() => openHit(hit)}
                    className="flex w-full flex-col items-start gap-0.5 border-b border-[#F1F5F2] px-4 py-3 text-left hover:bg-[#F7FBF8]"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1F6B4A]">
                      {hit.kind || hit.dashboard || "record"}
                    </span>
                    <span className="text-sm font-semibold text-[#1C1917]">{hit.title || hit.id}</span>
                    {hit.detail ? (
                      <span className="line-clamp-1 text-xs text-[#6B736E]">{hit.detail}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : searching && query.trim().length >= 2 ? (
              <p className="absolute left-0 top-[calc(100%+6px)] text-xs text-[#8A847A]">Searching live data…</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1F6B4A] px-4 text-sm font-semibold text-white transition hover:bg-[#18573c]"
          >
            <Search size={15} />
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E4DDD2] bg-white px-3 text-sm font-semibold text-[#1C1917] transition hover:border-[#1F6B4A]/40 hover:bg-[#F7FBF8]"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>
      {stats.length ? (
        <div className="flex gap-2 overflow-x-auto border-t border-[#EEF2EF] px-3 py-2.5">
          {stats.slice(0, 8).map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => {
                if (stat.dashboard) onOpenDashboard(stat.dashboard);
                else openOpsEva(stat.label);
              }}
              className="shrink-0 rounded-full border border-[#E4DDD2] bg-[#F7F4EE] px-3 py-1.5 text-xs font-semibold text-[#146C3A] transition hover:border-[#1F6B4A]/35 hover:bg-[#E8F3EC]"
            >
              {stat.label} · {stat.value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
