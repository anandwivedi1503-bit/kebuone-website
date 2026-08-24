"use client";

import { useEffect, useState } from "react";

export type OpsMoneySummary = {
  asOf?: string;
  bookings: {
    count: number;
    received: number;
    pending: number;
    deposit: number;
    fullyPaid: number;
    partial: number;
    unpaid: number;
  };
  payments: {
    razorpay: number;
    cash: number;
    walletCredit: number;
    successCount: number;
  };
  cashHandover: {
    dueToCompany: number;
    handedOver: number;
    dueCount: number;
  };
  wallets: {
    riders: number;
    creditBalance: number;
    depositHold: number;
  };
  refunds: {
    pending: number;
    pendingCount: number;
    refunded: number;
    refundedCount: number;
  };
};

const rupee = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function useOpsMoneySummary(pollMs = 12000) {
  const [summary, setSummary] = useState<OpsMoneySummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/ops/money-summary", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) setSummary(data.data);
      } catch {
        if (!cancelled) setSummary(null);
      }
    };
    void load();
    const timer = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pollMs]);

  return summary;
}

export default function OpsMoneyStrip() {
  const summary = useOpsMoneySummary();
  if (!summary) return null;

  const cards = [
    { label: "Booking received", value: rupee(summary.bookings.received), note: `${summary.bookings.count} bookings` },
    { label: "Booking pending", value: rupee(summary.bookings.pending), note: `${summary.bookings.partial} partial · ${summary.bookings.unpaid} unpaid` },
    { label: "Razorpay / UPI", value: rupee(summary.payments.razorpay), note: "Online receipts" },
    { label: "Cash at yard", value: rupee(summary.payments.cash), note: `${rupee(summary.cashHandover.dueToCompany)} due to company` },
    { label: "EVUDDY wallet", value: rupee(summary.wallets.creditBalance), note: `Hold ${rupee(summary.wallets.depositHold)} · not UPI` },
    { label: "Refunds pending", value: rupee(summary.refunds.pending), note: `${summary.refunds.pendingCount} tickets · refunded ${rupee(summary.refunds.refunded)}` },
  ];

  return (
    <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Live money snapshot
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Same Mongo totals on every money dashboard. Wallet credit is returned deposits and admin top-ups, not Razorpay UPI.
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-400">
          {summary.asOf ? new Date(summary.asOf).toLocaleString("en-IN") : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-lg font-black text-[#0A1134]">{card.value}</p>
            <p className="text-xs font-semibold text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
