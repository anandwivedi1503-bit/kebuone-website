"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, ImagePlus, X } from "lucide-react";
import { optimizeCashPhoto } from "@/lib/optimizeCashPhoto";

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
  const [recorded, setRecorded] = useState(false);
  const [receipt, setReceipt] = useState<{
    transactionId: string;
    amount: number;
    pendingAmount: number;
  } | null>(null);
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

  useEffect(() => {
    if (!recorded || !receipt) return;
    if (Math.abs(Number(pendingAmount || 0) - receipt.pendingAmount) < 0.01) return;
    setRecorded(false);
    setAmount(pendingAmount > 0 ? String(Number(pendingAmount.toFixed(2))) : "");
  }, [pendingAmount, recorded, receipt]);

  const pending = Number(pendingAmount || 0);
  if (!bookingId || pending <= 0.009) return null;

  const submit = async () => {
    const paid = Number(amount);
    if (!Number.isFinite(paid) || paid < 1) {
      setNote("Enter at least ₹1.");
      return;
    }
    if (paid > pending + 0.009) {
      setNote(`Cash cannot exceed the current remaining amount of ₹${pending.toFixed(2)}.`);
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
      const preparedPhoto = await optimizeCashPhoto(photo);
      if (preparedPhoto.size > 5 * 1024 * 1024) {
        setNote("Photo must be 5 MB or smaller. Retake it at a lower resolution.");
        return;
      }
      form.set("photo", preparedPhoto);
      const res = await fetch("/api/payments/cash", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (!data) {
        setNote(`Cash could not be recorded (server response ${res.status}). Check Transactions before retrying.`);
        return;
      }
      if (!res.ok || !data.success) {
        setNote(data.message || `Cash could not be recorded (server response ${res.status}).`);
        return;
      }
      const payment = data.data || {};
      const receiptId = String(payment.transactionId || "");
      setReceipt({
        transactionId: receiptId,
        amount: Number(payment.paidAmount || paid),
        pendingAmount: Number(payment.pendingAmount || 0),
      });
      setRecorded(true);
      setPhoto(null);
      const compressionNote = preparedPhoto.size < photo.size
        ? ` · photo reduced from ${(photo.size / 1024).toFixed(0)} KB to ${(preparedPhoto.size / 1024).toFixed(0)} KB`
        : "";
      setNote(`${receiptId ? `Cash recorded · receipt ${receiptId}` : "Cash recorded successfully."}${compressionNote}`);
      onDone?.();
    } catch {
      setNote("Connection failed. Check the booking in Transactions before retrying to avoid recording cash twice.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1 py-1 text-xs font-bold text-amber-950 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
          <span>{recorded ? "Cash recorded · receipt saved" : "Record rider cash at yard"}</span>
          <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 tabular-nums">₹{pending.toFixed(2)}</span>
          <ChevronDown size={15} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-2 space-y-2 border-t border-amber-200/80 pt-2">
      <input
        type="number"
        min={1}
        step="0.01"
        max={pending}
        value={amount}
        disabled={recorded}
        onChange={(e) => setAmount(e.target.value)}
        className="h-10 w-full rounded-xl border bg-white px-3 text-sm"
        placeholder="Amount received"
      />
      <input
        value={notes}
        disabled={recorded}
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
        disabled={busy || recorded}
        onClick={() => photoInput.current?.click()}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white text-sm font-bold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
      >
        {photo ? <ImagePlus size={16} /> : <Camera size={16} />}
        {photo ? "Retake / change cash photo" : "Capture cash photo"}
      </button>
      <button
        type="button"
        disabled={busy || !photo || recorded}
        onClick={() => void submit()}
        className="h-10 w-full rounded-xl bg-[#0A1134] text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : recorded ? "Cash recorded" : "Record cash"}
      </button>
      {receipt ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
          <p className="font-black">Latest cash receipt</p>
          <p>Receipt: {receipt.transactionId || "created"}</p>
          <p>Collected: ₹{receipt.amount.toFixed(2)} · Remaining: ₹{receipt.pendingAmount.toFixed(2)}</p>
        </div>
      ) : null}
      <p className="text-[11px] font-medium text-amber-900">
        Cash stays due to the company until the yard records a matching handover count on Transactions.
      </p>
        </div>
      </details>
      {note ? <p className="mt-2 text-xs font-semibold text-slate-700">{note}</p> : null}
    </div>
  );
}
