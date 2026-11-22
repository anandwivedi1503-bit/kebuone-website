"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const pending = Number(pendingAmount || 0);
  if (!bookingId || pending <= 0.009) return null;

  const submit = async () => {
    const paid = Number(amount);
    if (!Number.isFinite(paid) || paid < 1) {
      setNote("Enter at least ₹1.");
      return;
    }
    if (!photo) {
      setNote("Capture a photo of the cash received first.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const form = new FormData();
      form.set("bookingId", bookingId);
      form.set("amount", String(paid));
      form.set("notes", notes);
      form.set("photo", photo);
      const res = await fetch("/api/payments/cash", {
        method: "POST",
        body: form,
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
      <input
        ref={photoInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const next = event.currentTarget.files?.[0] || null;
          if (next && next.size > 5 * 1024 * 1024) {
            setPhoto(null);
            setNote("Photo must be 5 MB or smaller.");
            event.currentTarget.value = "";
            return;
          }
          setPhoto(next);
          setNote("");
        }}
      />
      {photo ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-2">
          {photoUrl ? <img src={photoUrl} alt="Cash evidence preview" className="h-16 w-16 rounded-lg object-cover" /> : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800">Cash photo attached</p>
            <p className="truncate text-[11px] text-slate-500">{photo.name}</p>
          </div>
          <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => photoInput.current?.click()}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white text-sm font-bold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
      >
        {photo ? <ImagePlus size={16} /> : <Camera size={16} />}
        {photo ? "Retake / change cash photo" : "Capture cash photo"}
      </button>
      <button
        type="button"
        disabled={busy || !photo}
        onClick={() => void submit()}
        className="h-10 w-full rounded-xl bg-[#0A1134] text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : "Record cash"}
      </button>
      {note ? <p className="text-xs font-semibold text-slate-700">{note}</p> : null}
      <p className="text-[11px] font-medium text-amber-900">
        Photo evidence is saved with the transaction. You must later mark this cash as handed to the company on Transactions.
      </p>
    </div>
  );
}
