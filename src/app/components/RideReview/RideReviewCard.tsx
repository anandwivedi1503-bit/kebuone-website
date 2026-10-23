"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

type ExistingReview = {
  reviewId?: string;
  stars?: number;
  status?: string;
  staffReply?: string;
  comment?: string;
};

type Props = {
  bookingId: string;
  token: string;
  existing?: ExistingReview | null;
  onSaved?: (review: ExistingReview) => void;
};

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-full text-lg shadow-sm transition ${
              n <= value
                ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RideReviewCard({ bookingId, token, existing, onSaved }: Props) {
  const [stars, setStars] = useState(existing?.stars || 5);
  const [vehicleStars, setVehicleStars] = useState(existing?.stars || 5);
  const [hubStars, setHubStars] = useState(existing?.stars || 5);
  const [comment, setComment] = useState(existing?.comment || "");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(Boolean(existing?.reviewId));

  if (saved) {
    return (
      <div className="rounded-[28px] border border-white/15 bg-white/95 px-6 py-6 text-left text-[#0F172A] shadow-[0_20px_50px_rgba(11,27,22,0.12)]">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#18B368]">
          <Sparkles size={14} />
          Your EVUDDY rating
        </p>
        <p className="mt-2 text-2xl font-black tracking-[-0.03em]">
          {"★".repeat(Number(existing?.stars || stars))}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {existing?.status === "Published"
            ? "Published on evuddy.com"
            : existing?.status === "Pending"
              ? "With the yard team for a quick look"
              : existing?.status || "Saved"}
        </p>
        {(existing?.comment || comment) ? (
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {existing?.comment || comment}
          </p>
        ) : null}
        {existing?.staffReply ? (
          <p className="mt-4 rounded-2xl bg-[#F4FFF8] px-4 py-3 text-sm text-[#0B1B16]">
            <span className="font-semibold text-[#18B368]">EVUDDY · </span>
            {existing.staffReply}
          </p>
        ) : null}
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          stars,
          vehicleStars,
          hubStars,
          comment,
          wouldRecommend,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Could not save rating.");
        return;
      }
      setSaved(true);
      onSaved?.(data.data);
    } catch {
      setMessage("Could not save rating.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white px-6 py-6 text-left text-[#0F172A] shadow-[0_24px_60px_rgba(11,27,22,0.16)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#18B368]">
        How was this ride?
      </p>
      <p className="mt-2 text-xl font-black tracking-[-0.03em]">
        A minute of your time helps the next rider.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Rate the scooter and the yard. 4–5 star notes can appear on evuddy.com.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StarPicker value={stars} onChange={setStars} label="Overall" />
        <StarPicker value={vehicleStars} onChange={setVehicleStars} label="Scooter" />
        <StarPicker value={hubStars} onChange={setHubStars} label="Hub / yard" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={500}
        className="mt-5 w-full rounded-2xl border border-slate-200 bg-[#F8FAF9] px-4 py-3 text-sm outline-none focus:border-[#18B368]"
        placeholder="Optional: pickup, range, and how the yard treated you"
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={wouldRecommend}
          onChange={(e) => setWouldRecommend(e.target.checked)}
        />
        I would recommend EVUDDY
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="mt-5 h-12 w-full rounded-full bg-[#0B1B16] text-sm font-bold text-white disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {busy ? "Saving..." : "Submit rating"}
      </button>
      {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
    </div>
  );
}
