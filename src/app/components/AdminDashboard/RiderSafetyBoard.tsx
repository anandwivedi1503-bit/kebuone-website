"use client";

import type { RiderSafetyRow } from "@/lib/riderSafetyOps";

type Props = {
  rows: RiderSafetyRow[];
  onOpenIot?: () => void;
};

function formatCountdown(minutes: number) {
  if (minutes >= 24 * 60) return `${Math.floor(minutes / (60 * 24))}d ${Math.floor((minutes % (60 * 24)) / 60)}h`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function RiderSafetyBoard({ rows, onOpenIot }: Props) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
        No active rider trips with a rental end time. When riders start rides in the app, countdown and phone GPS appear here for ops.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 12).map((row) => {
        const siren = row.alertLevel === "siren";
        const warn = row.alertLevel === "warning";
        return (
          <div
            key={row.bookingId}
            className={`rounded-2xl border p-4 shadow-sm ${
              siren
                ? "border-red-300 bg-gradient-to-r from-red-700 via-red-600 to-orange-500 text-white animate-pulse"
                : warn
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-extrabold tracking-wide ${siren ? "text-white/90" : "text-red-600"}`}>
                  {siren ? "🚨 SIREN · RETURN SOON" : warn ? "⚠️ ENDING SOON" : "TRIP SAFETY"}
                </p>
                <p className={`text-lg font-extrabold ${siren ? "text-white" : "text-slate-900"}`}>
                  {row.bookingId} · {row.userName || "Rider"}
                </p>
                <p className={`text-sm ${siren ? "text-white/90" : "text-slate-600"}`}>
                  {row.rentalMode} · {row.vehicleId} · +91{row.userPhone} · {row.rideStatus}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black tabular-nums ${siren ? "text-white" : "text-slate-900"}`}>
                  {formatCountdown(row.minutesUntilEnd)}
                </p>
                <p className={`text-xs font-semibold ${siren ? "text-white/80" : "text-slate-500"}`}>
                  until rental end
                </p>
              </div>
            </div>
            <div className={`mt-3 flex flex-wrap gap-3 text-xs font-semibold ${siren ? "text-white/90" : "text-slate-600"}`}>
              <span>
                {row.hasPhoneGps
                  ? `📍 Phone GPS ${row.riderPhoneLat?.toFixed(5)}, ${row.riderPhoneLng?.toFixed(5)}`
                  : "📍 Phone GPS waiting (rider app)"}
              </span>
              {row.riderPhoneUpdatedAt ? (
                <span>Updated {new Date(row.riderPhoneUpdatedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
              ) : null}
              {onOpenIot ? (
                <button
                  type="button"
                  className={`underline ${siren ? "text-white" : "text-emerald-700"}`}
                  onClick={onOpenIot}
                >
                  Open IoT map
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
