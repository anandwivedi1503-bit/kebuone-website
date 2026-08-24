"use client";

import { useState } from "react";

export default function CashCollectForm({
  bookingId,
  pendingAmount,
  onDone,
}: {
  bookingId: string;
  pendingAmount: number;
  onDone?: () => void;
}) {
  const [amount, setAmount] = useState(
    pendingAmount > 0 ? String(Number(pendingAmount.toFixed(2))) : ""
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const pending = Number(pendingAmount || 0);
  if (!bookingId || pending <= 0.009) return null;

  const submit = async () => {
    const paid = Number(amount);
    if (!Number.isFinite(paid) || paid < 1) {
      setNote("Enter at least ₹1.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/payments/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: paid,
          notes,
        }),
      });
      const data = await res.json();
      setNote(data.message || (data.success ? "Cash recorded." : "Failed."));
      if (data.success) {
        onDone?.();
      }
    } catch {
      setNote("Unable to record cash.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-bold text-amber-950">
        Rider cash at yard · remaining ₹{pending.toFixed(2)}
      </p>
      <input
        type="number"
        min={1}
        step="0.01"
        max={pending}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="h-10 w-full rounded-xl border bg-white px-3 text-sm"
        placeholder="Amount received"
      />
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-10 w-full rounded-xl border bg-white px-3 text-sm"
        placeholder="Optional note"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="h-10 w-full rounded-xl bg-[#0A1134] text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : "Record cash"}
      </button>
      {note ? <p className="text-xs font-semibold text-slate-700">{note}</p> : null}
      <p className="text-[11px] font-medium text-amber-900">
        This updates the booking immediately. You must later mark this cash as handed to the company on Transactions.
      </p>
    </div>
  );
}
