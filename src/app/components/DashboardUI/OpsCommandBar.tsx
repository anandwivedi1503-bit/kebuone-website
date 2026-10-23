"use client";

import { FormEvent, useEffect, useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react";

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
    <div className="no-print mb-5 overflow-hidden rounded-2xl border border-[#18B368]/20 bg-[#0B1B16] text-white shadow-[0_16px_50px_rgba(10,17,52,0.16)]">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <form onSubmit={submit} className="relative flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Sparkles
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6EE7A8]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Live search: phone, BK- id, rider, unpaid, KYC, refund…"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/10 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#18B368]"
            />
            {hits.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#10241c] shadow-2xl">
                {hits.map((hit, index) => (
                  <button
                    key={`${hit.kind}-${hit.id}-${index}`}
                    type="button"
                    onClick={() => openHit(hit)}
                    className="flex w-full flex-col items-start gap-0.5 border-b border-white/5 px-4 py-3 text-left hover:bg-white/10"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EE7A8]">
                      {hit.kind || hit.dashboard || "record"}
                    </span>
                    <span className="text-sm font-semibold text-white">{hit.title || hit.id}</span>
                    {hit.detail ? (
                      <span className="line-clamp-1 text-xs text-white/60">{hit.detail}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : searching && query.trim().length >= 2 ? (
              <p className="absolute left-0 top-[calc(100%+6px)] text-xs text-white/50">Searching live Mongo…</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#18B368] px-4 text-sm font-semibold text-white"
          >
            Ask Eva
          </button>
        </form>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
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
