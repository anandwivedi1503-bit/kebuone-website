"use client";

import { useCallback, useEffect, useState } from "react";

type HelpTicket = {
  ticketId?: string;
  category?: string;
  status?: string;
  description?: string;
  adminRemarks?: string;
};

const CATEGORIES = [
  { value: "BOOKING_ISSUE", label: "Booking / general" },
  { value: "UNLOCK_ISSUE", label: "Unlock / pickup OTP" },
  { value: "VEHICLE_BREAKDOWN", label: "Scooter breakdown" },
  { value: "BATTERY_ISSUE", label: "Battery / range / swap" },
  { value: "PAYMENT_ISSUE", label: "Payment" },
  { value: "REFUND_REQUEST", label: "Deposit refund" },
] as const;

export default function RiderComplaintTicket({
  bookingId,
  token,
  riderPhone,
  riderId,
  rideStatus,
}: {
  bookingId: string;
  token: string;
  riderPhone?: string;
  riderId?: string;
  rideStatus?: string;
}) {
  const [helpText, setHelpText] = useState("");
  const [helpStatus, setHelpStatus] = useState("");
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpCategory, setHelpCategory] = useState("BOOKING_ISSUE");
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>([]);

  const loadTickets = useCallback(async () => {
    if (!token) return;
    try {
      const ticketRes = await fetch("/api/tickets/mine", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const ticketData = await ticketRes.json();
      if (ticketData.success && Array.isArray(ticketData.data)) {
        setHelpTickets(ticketData.data);
      }
    } catch {
      /* keep last list */
    }
  }, [token]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const sendHelpTicket = async () => {
    setHelpStatus("");
    const description = helpText.trim();
    if (description.length < 10) {
      setHelpStatus("Describe the issue in at least 10 characters.");
      return;
    }
    if (!token || !bookingId) {
      setHelpStatus("Sign in and complete booking first.");
      return;
    }
    setHelpLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          userId: riderPhone || riderId,
          category: helpCategory || "BOOKING_ISSUE",
          description: `${rideStatus === "In Ride" ? "During ride: " : ""}${description}`.slice(
            0,
            500
          ),
          firebaseIdToken: token,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setHelpStatus(data.errors?.join(" ") || data.message || "Could not send ticket.");
        return;
      }
      setHelpText("");
      const createdId = String(data.data?.ticketId || "").trim();
      setHelpStatus(
        createdId
          ? `Support ticket ${createdId} sent. Track status below. Hub staff see it on Support.`
          : "Support ticket sent. You can track status below. Hub staff see it on Support."
      );
      await loadTickets();
    } finally {
      setHelpLoading(false);
    }
  };

  return (
    <div
      id="rider-complaint-ticket"
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_12px_32px_rgba(15,23,42,.06)]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18B368]">
        Rider complaint ticket
      </p>
      <p className="mt-1 font-bold text-[#0F172A]">Need help with this booking?</p>
      <p className="mt-1 text-sm text-slate-500">
        Use this on the payment step, at pickup, or mid-ride: unlock, breakdown, battery,
        payment. Hub staff see it immediately on Support and you see their reply below.
      </p>
      <label htmlFor="rider-ticket-category" className="mt-3 block text-xs font-semibold text-slate-600">
        Issue type
      </label>
      <select
        id="rider-ticket-category"
        value={helpCategory}
        onChange={(e) => setHelpCategory(e.target.value)}
        aria-label="Complaint category"
        className="mt-1 h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#18B368]"
      >
        {CATEGORIES.map((row) => (
          <option key={row.value} value={row.value}>
            {row.label}
          </option>
        ))}
      </select>
      <label htmlFor="rider-ticket-details" className="mt-3 block text-xs font-semibold text-slate-600">
        What happened
      </label>
      <textarea
        id="rider-ticket-details"
        value={helpText}
        onChange={(e) => setHelpText(e.target.value)}
        rows={3}
        aria-label="Complaint details"
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#18B368]"
        placeholder="What happened? Example: scooter stopped, battery died, puncture..."
      />
      <button
        type="button"
        disabled={helpLoading}
        onClick={() => void sendHelpTicket()}
        className="mt-3 h-11 rounded-full bg-[#0F172A] px-5 text-sm font-bold text-white disabled:opacity-60"
      >
        {helpLoading ? "Sending..." : "Send complaint ticket"}
      </button>
      {helpStatus ? (
        <p className="mt-2 text-sm text-slate-600" aria-live="polite">
          {helpStatus}
        </p>
      ) : null}
      {helpTickets.length ? (
        <div className="mt-4 space-y-2">
          {helpTickets.slice(0, 5).map((ticket) => (
            <div
              key={String(ticket.ticketId)}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-sm"
            >
              <p className="font-bold text-[#0F172A]">
                {ticket.ticketId} · {ticket.status} ·{" "}
                {String(ticket.category || "").replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-slate-600">{ticket.description}</p>
              {ticket.adminRemarks ? (
                <p className="mt-2 text-emerald-800">Staff: {ticket.adminRemarks}</p>
              ) : ticket.status === "OPEN" || ticket.status === "IN-PROGRESS" ? (
                <p className="mt-2 text-amber-800">Hub staff are working on this.</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
