"use client";

import { useEffect, useState } from "react";

export type YardQueueCounts = {
  readyForPickup: number;
  inRide: number;
  unpaid: number;
  rtoDue: number;
  pendingRefunds: number;
};

export function useYardQueue(pollMs = 20000) {
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
    const timer = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pollMs]);

  return { counts, liveBookings };
}

export default function YardQueueStrip() {
  const { counts } = useYardQueue();
  if (!counts) return null;

  const cards = [
    { label: "Ready for pickup", value: counts.readyForPickup, note: "OTP issued, at yard" },
    { label: "In ride", value: counts.inRide, note: "Scooters out" },
    { label: "Unpaid / partial", value: counts.unpaid, note: "OTP-on-partial still allowed" },
    { label: "RTO due", value: counts.rtoDue, note: "Today’s ₹280 + GST" },
    { label: "Refunds", value: counts.pendingRefunds, note: "Waiting approval" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {card.label}
          </p>
          <p className="mt-1 text-xl font-black tabular-nums text-[#0A1134]">{card.value}</p>
          <p className="text-[11px] text-slate-500">{card.note}</p>
        </div>
      ))}
    </div>
  );
}
