"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardCard from "../DashboardUI/DashboardCard";

type YardBooking = {
  _id: string;
  bookingId: string;
  userName?: string;
  userPhone?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  pickupHubName?: string;
  startHub?: string;
  currentHub?: string;
  rideStatus?: string;
  paymentStatus?: string;
  receivedAmount?: number;
  pendingAmount?: number;
  pickupOTPGenerated?: boolean;
};

function rupees(value: unknown) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function YardRideDesk() {
  const [bookings, setBookings] = useState<YardBooking[]>([]);
  const [search, setSearch] = useState("");
  const [pickupOtp, setPickupOtp] = useState("");
  const [rideEndOtp, setRideEndOtp] = useState("");
  const [endHub, setEndHub] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/bookings?limit=500", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setBookings(data.data || []);
    } catch {
      setMessage("Unable to load yard bookings.");
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(timer);
  }, []);

  const yardBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const active =
        booking.rideStatus === "Ready For Pickup" ||
        booking.rideStatus === "In Ride";
      if (!active) return false;
      if (!keyword) return true;
      return [
        booking.bookingId,
        booking.userName,
        booking.userPhone,
        booking.vehicleId,
        booking.vehicleNumber,
        booking.pickupHubName,
        booking.startHub,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [bookings, search]);

  const selected =
    yardBookings.find((item) => item._id === selectedId) || yardBookings[0];

  const startRide = async () => {
    if (!selected) return;
    if (!pickupOtp.trim()) {
      setMessage("Ask the rider for the pickup OTP, then enter it here.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rides/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selected.bookingId,
          pickupOTP: pickupOtp.trim(),
        }),
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? "Vehicle unlocked." : "Unable to start ride."));
      if (data.success) {
        setPickupOtp("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const endRide = async () => {
    if (!selected) return;
    if (Number(selected.pendingAmount || 0) > 0.009) {
      setMessage(
        `Remaining ${rupees(selected.pendingAmount)} must be paid on Book EV before ride end OTP is issued.`
      );
      return;
    }
    if (!rideEndOtp.trim() || !endHub.trim()) {
      setMessage("Enter the ride end OTP from the rider and the return hub.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rides/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selected.bookingId,
          rideEndOTP: rideEndOtp.trim(),
          endHub: endHub.trim(),
        }),
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? "Bike taken back." : "Unable to complete ride."));
      if (data.success) {
        setRideEndOtp("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardCard>
      <div className="mb-4">
        <h2 className="text-2xl font-black text-[#0A1134]">Yard ride desk</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rider tells you the pickup OTP to unlock. Ride end OTP is issued only after remaining payment — then the rider tells you that OTP to take the bike back.
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search booking, phone, vehicle, hub"
        className="mb-4 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#18B368]"
      />

      {yardBookings.length === 0 ? (
        <p className="text-sm text-slate-500">No scooters waiting for pickup or return right now.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {yardBookings.map((booking) => (
              <button
                type="button"
                key={booking._id}
                onClick={() => {
                  setSelectedId(booking._id);
                  setEndHub(String(booking.startHub || booking.pickupHubName || ""));
                  setMessage("");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left ${
                  selected?._id === booking._id
                    ? "border-[#18B368] bg-[#F6FFF9]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="font-bold">{booking.bookingId}</div>
                <div className="text-sm text-slate-600">
                  {booking.userName} · {booking.userPhone}
                </div>
                <div className="text-xs text-slate-500">
                  {booking.vehicleId} · {booking.rideStatus} · {booking.paymentStatus} · pending {rupees(booking.pendingAmount)}
                </div>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-bold text-[#0A1134]">{selected.bookingId}</p>
              <p className="text-sm text-slate-600">
                {selected.userName} · {selected.userPhone}
              </p>
              <p className="mt-1 text-sm">
                Bike {selected.vehicleId} / {selected.vehicleNumber || "-"} · Hub {selected.pickupHubName || selected.startHub}
              </p>
              <p className="mt-1 text-sm">
                Paid {rupees(selected.receivedAmount)} · Pending {rupees(selected.pendingAmount)}
              </p>

              {selected.rideStatus === "Ready For Pickup" ? (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-semibold">Pickup OTP from rider</label>
                  <input
                    value={pickupOtp}
                    onChange={(e) => setPickupOtp(e.target.value)}
                    placeholder="6-digit pickup OTP"
                    className="h-12 w-full rounded-xl border px-4"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void startRide()}
                    className="h-12 w-full rounded-xl bg-[#16A34A] font-bold text-white disabled:opacity-60"
                  >
                    {busy ? "Unlocking..." : "Verify pickup OTP and unlock"}
                  </button>
                </div>
              ) : Number(selected.pendingAmount || 0) > 0.009 ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Remaining {rupees(selected.pendingAmount)} is unpaid. Ride end OTP is not generated until the rider pays this on Book EV. Then they will tell you the ride end OTP.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-semibold">Ride end OTP from rider</label>
                  <input
                    value={rideEndOtp}
                    onChange={(e) => setRideEndOtp(e.target.value)}
                    placeholder="6-digit ride end OTP"
                    className="h-12 w-full rounded-xl border px-4"
                  />
                  <label className="block text-sm font-semibold">Return hub</label>
                  <input
                    value={endHub}
                    onChange={(e) => setEndHub(e.target.value)}
                    placeholder="Hub code or name"
                    className="h-12 w-full rounded-xl border px-4"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void endRide()}
                    className="h-12 w-full rounded-xl bg-[#0F172A] font-bold text-white disabled:opacity-60"
                  >
                    {busy ? "Returning..." : "Verify ride end OTP and take bike back"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {message ? <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p> : null}
    </DashboardCard>
  );
}
