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
  const [cashHandoverPhotoUrl, setCashHandoverPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const pending = Number(pendingAmount || 0);
  if (!bookingId || pending <= 0.009) return null;

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setNote("");
    try {
      const body = new FormData();
      body.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body });
      const upJson = await up.json();
      const url = upJson.url || upJson.data?.url;
      if (!url) {
        setNote("Photo upload failed. Try again.");
        return;
      }
      setCashHandoverPhotoUrl(String(url));
      setNote("Cash photo attached. You can record payment now.");
    } catch {
      setNote("Unable to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const paid = Number(amount);
    if (!Number.isFinite(paid) || paid < 1) {
      setNote("Enter at least ₹1.");
      return;
    }
    if (!cashHandoverPhotoUrl) {
      setNote("Upload a photo of cash received first.");
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
          cashHandoverPhotoUrl,
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

  const canRecord = Boolean(cashHandoverPhotoUrl) && !busy && !uploading;

  return (
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-bold text-amber-950">
        Rider cash at yard · remaining ₹{pending.toFixed(2)}
      </p>
      <label className="block text-[11px] font-semibold text-amber-900">
        Photo of cash received (required)
        <input
          type="file"
          accept="image/*"
          disabled={uploading || busy}
          className="mt-1 block w-full text-xs"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadPhoto(file);
          }}
        />
      </label>
      {cashHandoverPhotoUrl ? (
        <a
          href={cashHandoverPhotoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-[11px] font-semibold text-emerald-700 underline"
        >
          View attached photo
        </a>
      ) : null}
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
        disabled={!canRecord}
        onClick={() => void submit()}
        className="h-10 w-full rounded-xl bg-[#0A1134] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Saving..." : uploading ? "Uploading photo..." : "Record cash"}
      </button>
      {note ? <p className="text-xs font-semibold text-slate-700">{note}</p> : null}
      <p className="text-[11px] font-medium text-amber-900">
        Record cash only after uploading proof. The photo is saved on the booking in the dashboard.
      </p>
    </div>
  );
}
