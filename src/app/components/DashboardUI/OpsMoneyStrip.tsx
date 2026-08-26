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
    { label: "Cash at yard", value: rupee(summary.payments.cash), note: `${rupee(summary.cashHandover.dueToCompany)} still due to company` },
    { label: "EVUDDY wallet", value: rupee(summary.wallets.creditBalance), note: `Hold ${rupee(summary.wallets.depositHold)} is tracking, not UPI` },
    { label: "Refunds pending", value: rupee(summary.refunds.pending), note: `${summary.refunds.pendingCount} tickets · refunded ${rupee(summary.refunds.refunded)}` },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:mb-8 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700">
            Live money snapshot
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Same Mongo totals on every money dashboard. Wallet credit is returned deposits and admin top-ups, not Razorpay UPI.
          </p>
        </div>
        <p className="text-[11px] font-medium text-slate-400">
          {summary.asOf ? new Date(summary.asOf).toLocaleString("en-IN") : ""}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
            <p className="mt-1 text-base font-medium tabular-nums tracking-tight text-slate-950 sm:text-lg">{card.value}</p>
            <p className="text-[11px] font-medium text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
