"use client";

import { useEffect, useState } from "react";
import { OPS_POLL_MS, startOpsPoll } from "@/lib/opsPoll";

export type YardQueueCounts = {
  readyForPickup: number;
  inRide: number;
  unpaid: number;
  rtoDue: number;
  pendingRefunds: number;
};

export function useYardQueue(pollMs = OPS_POLL_MS) {
  const [counts, setCounts] = useState<YardQueueCounts | null>(null);
  const [liveBookings, setLiveBookings] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/ops/yard-queue", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setCounts(data.counts || null);
          setLiveBookings(data.liveBookings || []);
        }
      } catch {
        if (!cancelled) {
          setCounts(null);
          setLiveBookings([]);
        }
      }
    };
    void load();
    const stop = startOpsPoll(() => {
      void load();
    }, pollMs);
    return () => {
      cancelled = true;
      stop();
    };
  }, [pollMs]);

  return { counts, liveBookings };
}

export default function YardQueueStrip() {
  const { counts, liveBookings } = useYardQueue();
  if (!counts) return null;

  const cards = [
    { label: "Ready for pickup", value: counts.readyForPickup, note: "OTP issued, at yard" },
    { label: "In ride", value: counts.inRide, note: "Scooters out" },
    { label: "Unpaid / partial", value: counts.unpaid, note: "OTP-on-partial still allowed" },
    { label: "RTO due", value: counts.rtoDue, note: "Today’s GST-included fare" },
    { label: "Refunds", value: counts.pendingRefunds, note: "Waiting approval" },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#18B368]/15 bg-white/90 px-3 py-3 shadow-[0_8px_24px_rgba(10,17,52,0.05)] backdrop-blur-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-[#0A1134]">{card.value}</p>
            <p className="text-[11px] text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>

      {liveBookings.length > 0 ? (
        <details className="group rounded-2xl border border-[#18B368]/20 bg-white/95 px-4 py-3 shadow-sm open:pb-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[#0A1134] marker:content-none">
            <span className="text-[#18B368]">Live riders</span>
            <span className="ml-2 text-slate-500">({liveBookings.length}) — phone &amp; scooter</span>
          </summary>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
            {liveBookings.slice(0, 40).map((row: Record<string, unknown>) => {
              const phone = String(row.userPhone || "").replace(/\D/g, "").slice(-10);
              const tel = phone.length === 10 ? `tel:+91${phone}` : undefined;
              const maps = phone.length === 10
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(phone)}`
                : undefined;
              return (
                <li
                  key={String(row.bookingId || row._id)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A1134]">
                      {String(row.userName || "Rider")} · {String(row.bookingId || "")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {String(row.rideStatus || "")} · {String(row.vehicleId || "—")} · hub{" "}
                      {String(row.currentHub || row.startHub || "—")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {tel ? (
                      <a
                        href={tel}
                        className="rounded-lg bg-[#18B368] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Call rider
                      </a>
                    ) : null}
                    {maps ? (
                      <a
                        href={maps}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A1134]"
                      >
                        Maps
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">
            Scooter GPS markers appear on the IoT desk when device coordinates are online. Rider phone opens in dialer / Maps.
          </p>
        </details>
      ) : null}
    </div>
  );
}
