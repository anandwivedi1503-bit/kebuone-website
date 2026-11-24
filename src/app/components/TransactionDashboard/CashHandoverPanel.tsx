"use client";

import { useEffect, useState } from "react";
import { startOpsPoll } from "@/lib/opsPoll";

type CashHandoverState = {
  pendingCount: number;
  expectedAmount: number;
  varianceReviewCount: number;
  openBatches: Array<{
    reconciliationId: string;
    transactionIds: string[];
    expectedAmount: number;
    actualAmount: number;
    varianceAmount: number;
  }>;
  recentBatches: Array<{
    reconciliationId: string;
    transactionIds: string[];
    expectedAmount: number;
    actualAmount: number;
    varianceAmount: number;
    status: string;
    recordedBy: string;
    recordedAt: string;
    notes?: string;
    recounts?: Array<{ countedBy: string; countedAt: string; actualAmount: number; notes?: string }>;
  }>;
};

export default function CashHandoverPanel({ onDone }: { onDone?: () => void }) {
  const [state, setState] = useState<CashHandoverState | null>(null);
  const [cashCount, setCashCount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/payments/cash/reconcile", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      const next = data.data as CashHandoverState;
      setState(next);
    } catch {
      setMessage("Unable to load the cash handover total. Refresh and try again.");
    }
  }

  useEffect(() => {
    void load();
    return startOpsPoll(load);
  }, []);

  const openBatch = state?.openBatches?.[0] || null;
  const expectedAmount = Number(openBatch?.expectedAmount ?? state?.expectedAmount ?? 0);
  const actualAmount = cashCount.trim() === "" ? NaN : Number(cashCount);
  const variance = Number.isFinite(actualAmount)
    ? Number((actualAmount - expectedAmount).toFixed(2))
    : null;

  const submit = async () => {
    if (cashCount.trim() === "" || !Number.isFinite(actualAmount) || actualAmount < 0) {
      setMessage("Enter the cash counted before saving.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/payments/cash/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualAmount,
          notes,
          ...(openBatch?.reconciliationId ? { reconciliationId: openBatch.reconciliationId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.message || "Unable to save the cash count.");
        return;
      }
      setMessage(data.message || "Cash count saved.");
      setCashCount("");
      setNotes("");
      await load();
      onDone?.();
    } catch {
      setMessage("Connection failed. Refresh and check the handover record before retrying.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Yard cash control</p>
          <h2 className="mt-1 text-2xl font-black text-[#0A1134]">Cash handover & reconciliation</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Count the cash being handed to the company. Receipts are marked handed over only when the counted total matches the recorded total.
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {openBatch ? "Batch under review" : "Receipts due in your access scope"}
          </p>
          <p className="mt-1 text-xl font-black text-[#0A1134]">
            {openBatch
              ? `${openBatch.transactionIds?.length || 0} receipts`
              : `${state?.pendingCount || 0} receipts`}
          </p>
        </div>
      </div>

      {openBatch ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-black text-rose-900">Cash count needs review · {openBatch.reconciliationId}</p>
          <div className="mt-2 grid gap-2 text-sm text-rose-900 sm:grid-cols-3">
            <p>Expected: <b>₹{Number(openBatch.expectedAmount || 0).toFixed(2)}</b></p>
            <p>Last counted: <b>₹{Number(openBatch.actualAmount || 0).toFixed(2)}</b></p>
            <p>Difference: <b>₹{Math.abs(Number(openBatch.varianceAmount || 0)).toFixed(2)}</b></p>
          </div>
          <p className="mt-2 text-xs text-rose-800">Recount this same batch. If there is a shortage, add the missing cash before resolving it. New handovers stay blocked until this batch is cleared.</p>
          {Number(state?.pendingCount || 0) > 0 ? (
            <p className="mt-2 text-xs font-semibold text-rose-900">
              New receipts waiting after this batch: {state?.pendingCount} · ₹{Number(state?.expectedAmount || 0).toFixed(2)}. They are not included in the count above.
            </p>
          ) : null}
        </div>
      ) : null}
      {!openBatch && Number(state?.varianceReviewCount || 0) > 0 ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {state?.varianceReviewCount} receipt{state?.varianceReviewCount === 1 ? " is" : "s are"} in a shared variance batch that includes another yard. A Transactions administrator with access to the full batch must resolve it.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <label className="block text-sm font-bold text-slate-700">
          {openBatch ? "Final counted amount for this batch" : "Expected amount due"}
          <div className="mt-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-base font-black text-slate-700">
            ₹{expectedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </label>
        <label className="block text-sm font-bold text-slate-700">
          Actual cash counted (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            value={cashCount}
            onChange={(event) => setCashCount(event.target.value)}
            className="mt-1 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-bold text-slate-900"
            placeholder="Count the cash being handed over"
          />
        </label>
        <label className="block text-sm font-bold text-slate-700 md:col-span-2">
          Handover note (optional)
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            className="mt-1 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium text-slate-900"
            placeholder="Shift, cash bag, or handover reference"
          />
        </label>
        <div className="md:col-span-1">
          <button
            type="button"
            disabled={busy || (!openBatch && Number(state?.pendingCount || 0) === 0)}
            onClick={() => void submit()}
            className="h-12 w-full rounded-xl bg-[#0A1134] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Saving count…" : openBatch ? "Update count / resolve" : "Reconcile handover"}
          </button>
        </div>
      </div>

      {variance !== null ? (
        <p className={`mt-3 text-sm font-bold ${Math.abs(variance) < 0.01 ? "text-emerald-700" : "text-amber-800"}`}>
          {Math.abs(variance) < 0.01
            ? "Count matches the expected total."
            : `Difference: ${variance > 0 ? "+" : "−"}₹${Math.abs(variance).toFixed(2)}. The batch will stay under review until it matches.`}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p> : null}
      <p className="mt-3 text-xs text-slate-500">
        Cash receipt IDs, collector, and collection time remain on each transaction. A mismatch is recorded for review and does not mark cash as handed over.
      </p>
      {state?.recentBatches?.length ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-black text-[#0A1134]">Recent cash handovers</h3>
            <p className="text-xs text-slate-500">Count, staff member, time, and any variance recounts are kept for audit.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {state.recentBatches.map((batch) => {
              const lastCount = batch.recounts?.[batch.recounts.length - 1];
              return (
                <div key={batch.reconciliationId} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1.1fr_1fr_1fr_1.2fr] sm:items-center">
                  <div>
                    <p className="font-bold text-slate-900">{batch.reconciliationId}</p>
                    <p className="text-xs text-slate-500">{batch.transactionIds?.length || 0} receipts · {new Date(batch.recordedAt).toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-slate-700">Expected ₹{Number(batch.expectedAmount || 0).toFixed(2)}<br />Counted ₹{Number(batch.actualAmount || 0).toFixed(2)}</p>
                  <p className={`font-bold ${batch.status === "Matched" ? "text-emerald-700" : "text-rose-700"}`}>
                    {batch.status === "Matched" ? "Matched" : `Variance ₹${Math.abs(Number(batch.varianceAmount || 0)).toFixed(2)}`}
                  </p>
                  <p className="text-xs text-slate-600">
                    {batch.status === "Matched" && lastCount ? `Completed by ${lastCount.countedBy} · ${new Date(lastCount.countedAt).toLocaleString("en-IN")}` : `Recorded by ${batch.recordedBy}`}
                    {batch.notes ? <><br />{batch.notes}</> : null}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
