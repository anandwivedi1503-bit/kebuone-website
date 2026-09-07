"use client";

import { useState } from "react";

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
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-full text-lg ${
              n <= value ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
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
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
          Your rating
        </p>
        <p className="mt-1 text-lg font-black text-[#0F172A]">
          {"★".repeat(Number(existing?.stars || stars))}{" "}
          <span className="text-sm font-medium text-slate-600">
            {existing?.status || "Saved"}
          </span>
        </p>
        {(existing?.comment || comment) ? (
          <p className="mt-2 text-sm text-slate-700">{existing?.comment || comment}</p>
        ) : null}
        {existing?.staffReply ? (
          <p className="mt-2 text-sm text-emerald-900">EVUDDY: {existing.staffReply}</p>
        ) : null}
        {existing?.status === "Pending" ? (
          <p className="mt-2 text-xs text-amber-800">
            Lower scores wait for yard review before they appear on the website.
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
        setBusy(false);
        return;
      }
      setSaved(true);
      onSaved?.(data.data);
    } catch {
      setMessage("Could not save rating.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-white px-5 py-5 text-left">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
        Rate this ride
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Stars help other riders pick a hub. 4–5 star reviews with a comment can appear on evuddy.com.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StarPicker value={stars} onChange={setStars} label="Overall" />
        <StarPicker value={vehicleStars} onChange={setVehicleStars} label="Scooter" />
        <StarPicker value={hubStars} onChange={setHubStars} label="Hub / yard" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={500}
        className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#18B368]"
        placeholder="Optional: how was pickup, range, and the yard?"
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
        className="mt-4 h-11 rounded-full bg-[#0F172A] px-5 text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : "Submit rating"}
      </button>
      {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
    </div>
  );
}
