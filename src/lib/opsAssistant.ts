import { API_DASHBOARDS } from "@/lib/adminCan";
import { sessionHasAnyDashboard, type AdminSessionInfo } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import Booking from "@/models/Booking";
import Hub from "@/models/Hub";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Vehicle from "@/models/Vehicle";

export type OpsHit = {
  kind: "booking" | "rider" | "vehicle" | "ticket" | "hub";
  id: string;
  title: string;
  detail: string;
  dashboard: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function can(session: AdminSessionInfo, keys: readonly string[]) {
  return sessionHasAnyDashboard(session, ...keys);
}

export function opsAssistantBlocked(question: string) {
  return /\b(pay|razorpay|refund|otp|unlock|delete|approve kyc|transfer money)\b/i.test(
    question
  );
}

export async function searchOpsRecords(session: AdminSessionInfo, question: string) {
  await connectDB();
  const q = question.trim().slice(0, 200);
  const lower = q.toLowerCase();
  const digits = q.replace(/\D/g, "");
  const phone = digits.length === 10 ? digits : digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : "";
  const bookingId = (q.match(/\b(?:BK|RTO)-\d+\b/i) || [])[0]?.toUpperCase() || "";
  const riderId = (q.match(/\bRDR-\d+\b/i) || [])[0]?.toUpperCase() || "";
  const ticketId = (q.match(/\bTKT-[A-Z0-9-]+\b/i) || [])[0] || "";
  const token = escapeRegex(q.replace(/['"]/g, "").trim());
  const fuzzy = token.length >= 3 ? new RegExp(token, "i") : null;

  const wantUnpaid = /\b(unpaid|pending payment|due)\b/.test(lower);
  const wantInRide = /\b(in ride|live ride|ongoing)\b/.test(lower);
  const wantRto = /\b(rto|rent to own)\b/.test(lower);
  const wantAvailable = /\b(available scooter|available bike|free scooter)\b/.test(lower);
  const wantOpenTickets = /\b(open ticket|support|complaint)\b/.test(lower);

  const hits: OpsHit[] = [];

  const tasks: Array<Promise<void>> = [];

  if (can(session, API_DASHBOARDS.bookingsRead)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        const and: Record<string, unknown>[] = [];
        if (bookingId) and.push({ bookingId });
        if (riderId) and.push({ riderId });
        if (phone) and.push({ userPhone: phone });
        if (wantUnpaid) and.push({ paymentStatus: { $in: ["Pending", "Partial"] } });
        if (wantInRide) and.push({ rideStatus: "In Ride" });
        if (wantRto) and.push({ rentalMode: "Rent To Own" });
        if (!and.length && fuzzy) {
          and.push({
            $or: [
              { bookingId: fuzzy },
              { riderId: fuzzy },
              { userName: fuzzy },
              { userPhone: fuzzy },
              { vehicleId: fuzzy },
              { pickupCity: fuzzy },
              { startHub: fuzzy },
            ],
          });
        }
        if (and.length) filter.$and = and;
        else if (!wantUnpaid && !wantInRide && !wantRto && !phone && !bookingId && !riderId) {
          return;
        }
        const rows = await Booking.find(filter)
          .select("bookingId riderId userName userPhone rideStatus paymentStatus pendingAmount pickupCity startHub rentalMode vehicleId")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "booking",
            id: String(row.bookingId || ""),
            title: String(row.bookingId || "Booking"),
            detail: `${row.userName || row.riderId || ""} · ${row.rideStatus || ""} · ${row.paymentStatus || ""} · pending ₹${Number(row.pendingAmount || 0)}`,
            dashboard: String(row.rentalMode) === "Rent To Own" ? "renttoown" : "bookings",
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.ridersRead)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = {};
        const and: Record<string, unknown>[] = [{ ...NOT_DELETED_FILTER }];
        if (riderId) and.push({ riderId });
        else if (phone) and.push({ phone });
        else if (fuzzy) {
          and.push({
            $or: [{ riderId: fuzzy }, { fullName: fuzzy }, { phone: fuzzy }, { email: fuzzy }],
          });
        } else return;
        filter.$and = and;
        const rows = await Rider.find(filter)
          .select("riderId fullName phone approvalStatus status bookingEnabled")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "rider",
            id: String(row.riderId || ""),
            title: String(row.fullName || row.riderId || "Rider"),
            detail: `${row.riderId || ""} · ${row.phone || ""} · ${row.approvalStatus || row.status || ""}`,
            dashboard: "users",
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.vehiclesRead)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        const and: Record<string, unknown>[] = [];
        if (wantAvailable) and.push({ vehicleStatus: "Available" });
        else if (fuzzy) {
          and.push({
            $or: [
              { vehicleId: fuzzy },
              { registrationNumber: fuzzy },
              { currentHub: fuzzy },
              { vehicleModel: fuzzy },
            ],
          });
        }
        if (!and.length) return;
        filter.$and = and;
        const rows = await Vehicle.find(filter)
          .select("vehicleId registrationNumber vehicleStatus currentHub vehicleModel batteryPercentage")
          .sort({ updatedAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "vehicle",
            id: String(row.vehicleId || ""),
            title: String(row.vehicleId || row.registrationNumber || "Vehicle"),
            detail: `${row.registrationNumber || ""} · ${row.vehicleStatus || ""} · ${row.currentHub || ""} · ${row.batteryPercentage ?? ""}%`,
            dashboard: "vehicles",
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.tickets) && (wantOpenTickets || ticketId || riderId || phone || fuzzy)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        const and: Record<string, unknown>[] = [];
        if (ticketId) and.push({ ticketId });
        if (riderId) and.push({ riderId });
        if (phone) and.push({ riderPhone: phone });
        if (wantOpenTickets) and.push({ status: { $in: ["OPEN", "IN-PROGRESS"] } });
        if (fuzzy && !ticketId && !wantOpenTickets) {
          and.push({
            $or: [{ ticketId: fuzzy }, { bookingId: fuzzy }, { description: fuzzy }, { riderPhone: fuzzy }],
          });
        }
        if (and.length) filter.$and = and;
        const rows = await Ticket.find(filter)
          .select("ticketId bookingId riderId status category riderPhone")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "ticket",
            id: String(row.ticketId || ""),
            title: String(row.ticketId || "Ticket"),
            detail: `${row.category || ""} · ${row.status || ""} · ${row.bookingId || row.riderId || ""}`,
            dashboard: "support",
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.hubsRead) && /\b(hub|yard)\b/.test(lower) && fuzzy) {
    tasks.push(
      (async () => {
        const rows = await Hub.find({
          ...NOT_DELETED_FILTER,
          $or: [{ hubName: fuzzy }, { hubCode: fuzzy }, { city: fuzzy }],
        })
          .select("hubName hubCode city status")
          .limit(8)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "hub",
            id: String(row.hubCode || row.hubName || ""),
            title: String(row.hubName || row.hubCode || "Hub"),
            detail: `${row.hubCode || ""} · ${row.city || ""} · ${row.status || ""}`,
            dashboard: "hub",
          });
        }
      })()
    );
  }

  await Promise.all(tasks);
  return hits.slice(0, 20);
}

export function formatOpsAnswer(question: string, hits: OpsHit[]) {
  if (!hits.length) {
    return `No matching ops records for “${question}”. Try a booking ID (BK-000001), rider ID, 10-digit phone, or “unpaid bookings”. I only search what this login can see. I cannot pay, refund, or confirm OTP.`;
  }
  const lines = hits.slice(0, 8).map((hit, index) => `${index + 1}. ${hit.title} — ${hit.detail}`);
  return `Found ${hits.length} record${hits.length === 1 ? "" : "s"}. Tap a result to open that dashboard.\n${lines.join("\n")}\n\nI cannot take payment, refund, unlock, or enter OTP. Confirm those on the dashboard.`;
}
