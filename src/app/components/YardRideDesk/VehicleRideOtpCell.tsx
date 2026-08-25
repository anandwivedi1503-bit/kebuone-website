"use client";

import { useState } from "react";
import CashCollectForm from "./CashCollectForm";

type BookingLite = {
  bookingId?: string;
  pendingAmount?: number;
  paymentStatus?: string;
  rideStatus?: string;
  startHub?: string;
  pickupHubName?: string;
  pickupOTPVerified?: boolean;
  pickupOTPGenerated?: boolean;
  rideEndOTPGenerated?: boolean;
  riderReturnedAt?: string | Date;
};

type VehicleLite = {
  vehicleId?: string;
  currentBookingId?: string;
  vehicleStatus?: string;
  currentHub?: string;
};

export default function VehicleRideOtpCell({
  vehicle,
  booking,
  onDone,
}: {
  vehicle: VehicleLite;
  booking?: BookingLite | null;
  onDone?: () => void;
}) {
  const [pickupOtp, setPickupOtp] = useState("");
  const [rideEndOtp, setRideEndOtp] = useState("");
  const [endHub, setEndHub] = useState(
    String(booking?.startHub || booking?.pickupHubName || vehicle.currentHub || "")
  );
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const status = String(vehicle.vehicleStatus || booking?.rideStatus || "");
  const bookingId = booking?.bookingId || vehicle.currentBookingId || "";
  const pending = Number(booking?.pendingAmount || 0);
  const pickupVerified = Boolean(booking?.pickupOTPVerified);
  const endOtpReady = Boolean(booking?.rideEndOTPGenerated || booking?.riderReturnedAt);
  const deskStatuses = [
    "Booked",
    "Reserved",
    "Payment Pending",
    "Ready For Pickup",
    "In Ride",
  ];

  if (!bookingId || !deskStatuses.includes(status)) {
    return <span className="text-slate-400">—</span>;
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setNote("");
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const confirmPickup = () => {
    if (!pickupOtp.trim()) {
      setNote("Enter pickup OTP from the rider.");
      return;
    }
    const confirmed = window.confirm(
      "Confirm pickup OTP and unlock for the rider? The rider then swipes Ride started on Book EV."
    );
    if (!confirmed) return;
    void run(async () => {
      const res = await fetch("/api/rides/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, pickupOTP: pickupOtp.trim() }),
      });
      const data = await res.json();
      setNote(data.message || (data.success ? "Unlocked." : "Failed."));
      if (data.success) {
        setPickupOtp("");
        onDone?.();
      }
    });
  };

  const takeBack = () =>
    run(async () => {
      if (pending > 0.009) {
        setNote(`Pay remaining ₹${pending.toFixed(2)} first. Ride end OTP is not issued yet.`);
        return;
      }
      if (!rideEndOtp.trim() || !endHub.trim()) {
        setNote("Enter ride end OTP and return hub.");
        return;
      }
      const res = await fetch("/api/rides/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rideEndOTP: rideEndOtp.trim(),
          endHub: endHub.trim(),
        }),
      });
      const data = await res.json();
      setNote(data.message || (data.success ? "Returned." : "Failed."));
      if (data.success) {
        setRideEndOtp("");
        onDone?.();
      }
    });

  return (
    <div className="min-w-[220px] space-y-2 text-left">
      <p className="text-xs font-semibold text-slate-500">{bookingId}</p>
      {pending > 0.009 ? (
        <CashCollectForm bookingId={bookingId} pendingAmount={pending} onDone={onDone} />
      ) : null}
      {status === "Ready For Pickup" && !pickupVerified ? (
        <>
          <input
            value={pickupOtp}
            onChange={(e) => setPickupOtp(e.target.value)}
            placeholder="Pickup OTP"
            className="h-10 w-full rounded-xl border px-3 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirmPickup()}
            className="h-10 w-full rounded-xl bg-[#16A34A] text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save pickup OTP"}
          </button>
        </>
      ) : status === "Ready For Pickup" && pickupVerified ? (
        <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
          Unlocked. Waiting for rider to swipe Ride started on Book EV.
        </p>
      ) : status === "In Ride" && pending > 0.009 ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          Remaining can also be paid on Book EV. Then the rider swipes Ride end.
        </p>
      ) : status === "In Ride" && !endOtpReady ? (
        <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
          Waiting for rider to swipe Ride end. Then enter the ride end OTP here.
        </p>
      ) : status === "In Ride" && endOtpReady ? (
        <>
          <input
            value={rideEndOtp}
            onChange={(e) => setRideEndOtp(e.target.value)}
            placeholder="Ride end OTP"
            className="h-10 w-full rounded-xl border px-3 text-sm"
          />
          <input
            value={endHub}
            onChange={(e) => setEndHub(e.target.value)}
            placeholder="Return hub"
            className="h-10 w-full rounded-xl border px-3 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void takeBack()}
            className="h-10 w-full rounded-xl bg-[#0F172A] text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Returning..." : "Take back"}
          </button>
        </>
      ) : pending <= 0.009 ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          Paid. Pickup OTP appears on Book EV after the first payment.
        </p>
      ) : null}
      {note ? <p className="text-xs text-slate-600">{note}</p> : null}
    </div>
  );
}
