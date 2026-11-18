"use client";

import { useEffect, useState } from "react";
import "@/app/components/DashboardUI/ops-shell.css";

const DESKS = [
  {
    id: "Bookings",
    title: "Yard queue",
    rows: ["BK-1042 · Ready for pickup · deposit held", "BK-1048 · In ride · battery 78%"],
  },
  {
    id: "Refunds",
    title: "Security deposit",
    rows: ["RF-00021 · ₹2,500 · Razorpay · PENDING", "RF-00018 · ₹2,500 · Wallet credit · REFUNDED"],
  },
  {
    id: "Reviews",
    title: "Rider reviews",
    rows: ["5★ · Hub pickup was quick", "4★ · Battery swap at Alambagh"],
  },
  {
    id: "Fleet",
    title: "Lock and hubs",
    rows: ["EV-14 · Locked · Available", "EV-09 · Unlocked · Ready for pickup"],
  },
];

export default function OpsCrmPreviewPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % DESKS.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const desk = DESKS[index];

  return (
    <div className="ops-shell min-h-screen">
      <aside className="ops-sidebar fixed inset-y-0 left-0 hidden w-[272px] p-5 lg:block">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#18B368]">EVUDDY OPS</p>
        <p className="mt-2 text-lg font-medium text-[#0A1134]">Command center</p>
        <div className="mt-6 space-y-1">
          {DESKS.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`ops-sidebar-item block w-full rounded-xl px-3 py-2 text-left text-sm ${
                itemIndex === index ? "ops-sidebar-item-active" : ""
              }`}
            >
              {item.id}
            </button>
          ))}
        </div>
      </aside>
      <main className="min-h-screen px-4 py-6 lg:ml-[272px] lg:px-8">
        <p className="ops-live-pill mb-4">Live · desks switch on their own</p>
        <div key={desk.id} className="ops-desk-stage">
          <div className="ops-kpi-grid mb-5">
            {["12 in ride", "4 refunds", "9 reviews", "2 locks open"].map((label) => (
              <div key={label} className="ops-glass-card p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Today</p>
                <p className="mt-2 text-lg font-medium text-[#0A1134]">{label}</p>
              </div>
            ))}
          </div>
          <section className="ops-glass-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f5f3f]">{desk.id}</p>
            <h1 className="mt-2 text-2xl font-medium text-[#0A1134]">{desk.title}</h1>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {desk.rows.map((row) => (
                <li key={row} className="rounded-xl bg-white/60 px-3 py-2">
                  {row}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
