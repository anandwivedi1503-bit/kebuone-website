import { API_DASHBOARDS } from "@/lib/adminCan";
import { sessionHasAnyDashboard, type AdminSessionInfo } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import Battery from "@/models/Battery";
import Booking from "@/models/Booking";
import Hub from "@/models/Hub";
import Partner from "@/models/Partner";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";

export type OpsHit = {
  kind: string;
  id: string;
  title: string;
  detail: string;
  dashboard: string;
  badge?: string;
};

export type OpsStat = {
  label: string;
  value: string;
  dashboard?: string;
};

function can(session: AdminSessionInfo, keys: readonly string[]) {
  return sessionHasAnyDashboard(session, ...keys);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type OpsQueryTokens = {
  asked: string;
  phone: string;
  bookingId: string;
  riderId: string;
  ticketId: string;
  vehicleToken: string;
  fuzzy: RegExp | null;
  wantUnpaid: boolean;
  wantInRide: boolean;
  wantReadyPickup: boolean;
  wantRto: boolean;
  wantAvailable: boolean;
  wantOpenTickets: boolean;
  wantKyc: boolean;
  wantRefunds: boolean;
  wantCounts: boolean;
  wantSummary: boolean;
};

export function parseOpsQuery(question: string): OpsQueryTokens {
  const asked = question.trim().slice(0, 240);
  const digits = asked.replace(/\D/g, "");
  const phone =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : "";
  const bookingId = (asked.match(/\b(?:BK|RTO)-\d+\b/i) || [])[0]?.toUpperCase() || "";
  const riderId = (asked.match(/\bRDR-\d+\b/i) || [])[0]?.toUpperCase() || "";
  const ticketId = (asked.match(/\bTKT-[A-Z0-9-]+\b/i) || [])[0] || "";
  const vehicleToken = (asked.match(/\b(?:EV|VH|VEH)[-_]?\w+\b/i) || [])[0] || "";
  const token = escapeRegex(asked.replace(/['"]/g, "").trim());
  const fuzzy = token.length >= 2 ? new RegExp(token, "i") : null;

  return {
    asked,
    phone,
    bookingId,
    riderId,
    ticketId,
    vehicleToken,
    fuzzy,
    wantUnpaid: /\b(unpaid|pending payment|due|partial|बकाया|बाकी)\b/i.test(asked),
    wantInRide: /\b(in ride|live ride|ongoing|on trip|राइड में)\b/i.test(asked),
    wantReadyPickup: /\b(ready for pickup|pickup ready|awaiting pickup|pickup queue)\b/i.test(asked),
    wantRto: /\b(rto|rent to own|रेंट टू ओन)\b/i.test(asked),
    wantAvailable: /\b(available scooter|available bike|free scooter|available fleet|उपलब्ध)\b/i.test(
      asked
    ),
    wantOpenTickets: /\b(open ticket|support|complaint|टिकट|शिकायत)\b/i.test(asked),
    wantKyc: /\b(kyc|pending kyc|approve rider|verification)\b/i.test(asked),
    wantRefunds: /\b(refund|refunds|deposit return)\b/i.test(asked),
    wantCounts: /\b(how many|count|total|kitne|कितने|संख्या)\b/i.test(asked),
    wantSummary: /\b(overview|summary|today|live status|status board|pulse|how many|count|total)\b/i.test(
      asked
    ),
  };
}

/**
 * Always-on multi-collection search — like Uber ops command palette.
 * Any 2+ char query fans out across bookings, riders, vehicles, tickets, refunds, etc.
 */
export async function universalOpsSearch(
  session: AdminSessionInfo,
  q: OpsQueryTokens
): Promise<{ hits: OpsHit[]; stats: OpsStat[]; elapsedMs: number }> {
  const started = Date.now();
  await connectDB();
  const hits: OpsHit[] = [];
  const stats: OpsStat[] = [];
  const tasks: Array<Promise<void>> = [];
  const hasIdentity = Boolean(q.phone || q.bookingId || q.riderId || q.ticketId || q.vehicleToken);
  const hasText = Boolean(q.fuzzy);
  const searchAll = hasIdentity || hasText;

  if (q.wantSummary || q.wantCounts || q.wantUnpaid || q.wantInRide || q.wantOpenTickets || q.wantKyc || q.wantAvailable) {
    if (can(session, API_DASHBOARDS.bookingsRead)) {
      tasks.push(
        (async () => {
          const [unpaid, inRide, rtoDue, ready] = await Promise.all([
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              paymentStatus: { $in: ["Pending", "Partial"] },
            }).maxTimeMS(1500),
            Booking.countDocuments({ ...NOT_DELETED_FILTER, rideStatus: "In Ride" }).maxTimeMS(1500),
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              rentalMode: "Rent To Own",
              paymentStatus: { $in: ["Pending", "Partial"] },
            }).maxTimeMS(1500),
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              rideStatus: "Ready For Pickup",
            }).maxTimeMS(1500),
          ]);
          if (q.wantSummary || q.wantCounts || q.wantUnpaid) {
            stats.push({ label: "Unpaid", value: String(unpaid), dashboard: "bookings" });
          }
          if (q.wantSummary || q.wantCounts || q.wantInRide) {
            stats.push({ label: "In ride", value: String(inRide), dashboard: "fleet" });
          }
          if (q.wantSummary || q.wantCounts || q.wantRto) {
            stats.push({ label: "RTO due", value: String(rtoDue), dashboard: "renttoown" });
          }
          if (q.wantSummary || q.wantCounts || q.wantReadyPickup) {
            stats.push({ label: "Pickup ready", value: String(ready), dashboard: "bookings" });
          }
        })()
      );
    }
    if (can(session, API_DASHBOARDS.tickets) && (q.wantSummary || q.wantCounts || q.wantOpenTickets)) {
      tasks.push(
        (async () => {
          const open = await Ticket.countDocuments({
            ...NOT_DELETED_FILTER,
            status: { $in: ["OPEN", "IN-PROGRESS"] },
          }).maxTimeMS(1500);
          stats.push({ label: "Tickets", value: String(open), dashboard: "support" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.ridersRead) && (q.wantSummary || q.wantCounts || q.wantKyc)) {
      tasks.push(
        (async () => {
          const pending = await Rider.countDocuments({
            ...NOT_DELETED_FILTER,
            $or: [{ approvalStatus: "Pending" }, { status: "Pending" }],
          }).maxTimeMS(1500);
          stats.push({ label: "KYC", value: String(pending), dashboard: "kyc" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.vehiclesRead) && (q.wantSummary || q.wantCounts || q.wantAvailable)) {
      tasks.push(
        (async () => {
          const available = await Vehicle.countDocuments({
            ...NOT_DELETED_FILTER,
            vehicleStatus: "Available",
          }).maxTimeMS(1500);
          stats.push({ label: "Available", value: String(available), dashboard: "vehicles" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.refunds) && (q.wantSummary || q.wantCounts || q.wantRefunds)) {
      tasks.push(
        (async () => {
          const pending = await Refund.countDocuments({
            ...NOT_DELETED_FILTER,
            status: "PENDING",
          }).maxTimeMS(1500);
          stats.push({ label: "Refunds", value: String(pending), dashboard: "refunds" });
        })()
      );
    }
  }

  if (can(session, API_DASHBOARDS.bookingsRead) && (searchAll || q.wantUnpaid || q.wantInRide || q.wantReadyPickup || q.wantRto)) {
    tasks.push(
      (async () => {
        const and: Record<string, unknown>[] = [];
        if (q.bookingId) and.push({ bookingId: q.bookingId });
        if (q.riderId) and.push({ riderId: q.riderId });
        if (q.phone) and.push({ userPhone: q.phone });
        if (q.wantUnpaid) and.push({ paymentStatus: { $in: ["Pending", "Partial"] } });
        if (q.wantInRide) and.push({ rideStatus: "In Ride" });
        if (q.wantReadyPickup) and.push({ rideStatus: "Ready For Pickup" });
        if (q.wantRto) and.push({ rentalMode: "Rent To Own" });
        if (!and.length && q.fuzzy) {
          and.push({
            $or: [
              { bookingId: q.fuzzy },
              { riderId: q.fuzzy },
              { userName: q.fuzzy },
              { userPhone: q.fuzzy },
              { vehicleId: q.fuzzy },
              { pickupCity: q.fuzzy },
              { startHub: q.fuzzy },
            ],
          });
        }
        if (!and.length) return;
        const rows = await Booking.find({ ...NOT_DELETED_FILTER, $and: and })
          .select(
            "bookingId riderId userName userPhone rideStatus paymentStatus pendingAmount pickupCity startHub rentalMode vehicleId"
          )
          .sort({ createdAt: -1 })
          .limit(12)
          .lean()
          .maxTimeMS(2200);
        for (const row of rows) {
          hits.push({
            kind: "booking",
            id: String(row.bookingId || ""),
            title: String(row.bookingId || "Booking"),
            detail: `${row.userName || row.riderId || ""} · ${row.rideStatus || ""} · ${row.paymentStatus || ""} · pending ₹${Number(row.pendingAmount || 0)} · ${row.startHub || row.pickupCity || ""}`,
            dashboard: String(row.rentalMode) === "Rent To Own" ? "renttoown" : "bookings",
            badge: String(row.paymentStatus || row.rideStatus || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.ridersRead) && (searchAll || q.wantKyc)) {
    tasks.push(
      (async () => {
        const and: Record<string, unknown>[] = [{ ...NOT_DELETED_FILTER }];
        if (q.riderId) and.push({ riderId: q.riderId });
        else if (q.phone) and.push({ phone: q.phone });
        else if (q.wantKyc && !q.fuzzy) {
          and.push({ $or: [{ approvalStatus: "Pending" }, { status: "Pending" }] });
        } else if (q.fuzzy) {
          and.push({
            $or: [{ riderId: q.fuzzy }, { fullName: q.fuzzy }, { phone: q.fuzzy }, { email: q.fuzzy }],
          });
        } else return;
        const rows = await Rider.find({ $and: and })
          .select("riderId fullName phone approvalStatus status bookingEnabled")
          .sort({ createdAt: -1 })
          .limit(12)
          .lean()
          .maxTimeMS(2200);
        for (const row of rows) {
          hits.push({
            kind: "rider",
            id: String(row.riderId || row.phone || ""),
            title: String(row.fullName || row.riderId || "Rider"),
            detail: `${row.riderId || ""} · ${row.phone || ""} · ${row.approvalStatus || row.status || ""} · booking ${row.bookingEnabled ? "on" : "off"}`,
            dashboard:
              q.wantKyc || String(row.approvalStatus) === "Pending" ? "kyc" : "users",
            badge: String(row.approvalStatus || row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.vehiclesRead) && (searchAll || q.wantAvailable)) {
    tasks.push(
      (async () => {
        const and: Record<string, unknown>[] = [];
        if (q.wantAvailable) and.push({ vehicleStatus: "Available" });
        if (q.vehicleToken) {
          const vFuzzy = new RegExp(escapeRegex(q.vehicleToken), "i");
          and.push({ $or: [{ vehicleId: vFuzzy }, { registrationNumber: vFuzzy }] });
        } else if (!q.wantAvailable && q.fuzzy) {
          and.push({
            $or: [
              { vehicleId: q.fuzzy },
              { registrationNumber: q.fuzzy },
              { currentHub: q.fuzzy },
              { vehicleModel: q.fuzzy },
            ],
          });
        }
        if (!and.length) return;
        const rows = await Vehicle.find({ ...NOT_DELETED_FILTER, $and: and })
          .select(
            "vehicleId registrationNumber vehicleStatus currentHub vehicleModel batteryPercentage"
          )
          .sort({ updatedAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2200);
        for (const row of rows) {
          hits.push({
            kind: "vehicle",
            id: String(row.vehicleId || ""),
            title: String(row.vehicleId || row.registrationNumber || "Vehicle"),
            detail: `${row.registrationNumber || ""} · ${row.vehicleStatus || ""} · ${row.currentHub || ""} · ${row.batteryPercentage ?? ""}%`,
            dashboard: "vehicles",
            badge: String(row.vehicleStatus || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.tickets) && (searchAll || q.wantOpenTickets)) {
    tasks.push(
      (async () => {
        const and: Record<string, unknown>[] = [];
        if (q.ticketId) and.push({ ticketId: q.ticketId });
        if (q.riderId) and.push({ riderId: q.riderId });
        if (q.phone) and.push({ riderPhone: q.phone });
        if (q.wantOpenTickets) and.push({ status: { $in: ["OPEN", "IN-PROGRESS"] } });
        if (!and.length && q.fuzzy) {
          and.push({
            $or: [
              { ticketId: q.fuzzy },
              { bookingId: q.fuzzy },
              { description: q.fuzzy },
              { riderPhone: q.fuzzy },
              { riderId: q.fuzzy },
            ],
          });
        }
        if (!and.length) return;
        const rows = await Ticket.find({ ...NOT_DELETED_FILTER, $and: and })
          .select("ticketId bookingId riderId status category riderPhone")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2200);
        for (const row of rows) {
          hits.push({
            kind: "ticket",
            id: String(row.ticketId || ""),
            title: String(row.ticketId || "Ticket"),
            detail: `${row.category || ""} · ${row.status || ""} · ${row.bookingId || row.riderId || ""}`,
            dashboard: "support",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.refunds) && (searchAll || q.wantRefunds)) {
    tasks.push(
      (async () => {
        const and: Record<string, unknown>[] = [];
        if (q.wantRefunds && !q.bookingId && !q.riderId && !q.phone && !q.fuzzy) {
          and.push({ status: "PENDING" });
        }
        if (q.bookingId) and.push({ bookingId: q.bookingId });
        if (q.riderId) and.push({ riderId: q.riderId });
        if (!and.length && q.fuzzy) {
          and.push({
            $or: [{ refundId: q.fuzzy }, { bookingId: q.fuzzy }, { riderId: q.fuzzy }],
          });
        }
        if (!and.length) return;
        const rows = await Refund.find({ ...NOT_DELETED_FILTER, $and: and })
          .select("refundId bookingId riderId amount status")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2200);
        for (const row of rows) {
          hits.push({
            kind: "refund",
            id: String(row.refundId || ""),
            title: String(row.refundId || "Refund"),
            detail: `${row.bookingId || ""} · ₹${Number(row.amount || 0)} · ${row.status || ""}`,
            dashboard: "refunds",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.walletRead) && (q.phone || q.riderId || (q.fuzzy && /\bwallet\b/i.test(q.asked)))) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (q.riderId) filter.riderId = q.riderId;
        else if (q.phone) filter.phone = q.phone;
        else return;
        const rows = await Wallet.find(filter)
          .select("riderId phone balance status")
          .limit(5)
          .lean()
          .maxTimeMS(1800);
        for (const row of rows) {
          hits.push({
            kind: "wallet",
            id: String(row.riderId || row.phone || ""),
            title: `Wallet ${row.riderId || row.phone || ""}`,
            detail: `Balance ₹${Number(row.balance || 0)} · ${row.status || ""}`,
            dashboard: "wallet",
            badge: String(row.status || "Wallet"),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.transactions) && (q.bookingId || (q.fuzzy && /\b(txn|transaction|payment)\b/i.test(q.asked)))) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (q.bookingId) filter.bookingId = q.bookingId;
        else if (q.fuzzy) filter.$or = [{ bookingId: q.fuzzy }, { transactionId: q.fuzzy }, { userName: q.fuzzy }];
        else return;
        const rows = await Transaction.find(filter)
          .select("transactionId bookingId userName amount status paymentMethod")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(1800);
        for (const row of rows) {
          hits.push({
            kind: "transaction",
            id: String(row.transactionId || ""),
            title: String(row.transactionId || "Txn"),
            detail: `${row.bookingId || ""} · ₹${Number(row.amount || 0)} · ${row.paymentMethod || ""} · ${row.status || ""}`,
            dashboard: "transactions",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.partners) && (searchAll || /\bpartner\b/i.test(q.asked))) {
    tasks.push(
      (async () => {
        if (!q.fuzzy && !q.phone) return;
        const rows = await Partner.find({
          ...NOT_DELETED_FILTER,
          $or: [
            ...(q.fuzzy
              ? [
                  { organizationName: q.fuzzy },
                  { fullName: q.fuzzy },
                  { phone: q.fuzzy },
                  { email: q.fuzzy },
                ]
              : []),
            ...(q.phone ? [{ phone: q.phone }] : []),
          ],
        })
          .select("organizationName fullName phone applicationStatus")
          .limit(8)
          .lean()
          .maxTimeMS(1800);
        for (const row of rows) {
          hits.push({
            kind: "partner",
            id: String(row.organizationName || row.fullName || ""),
            title: String(row.organizationName || row.fullName || "Partner"),
            detail: `${row.fullName || ""} · ${row.phone || ""} · ${row.applicationStatus || ""}`,
            dashboard: "partner",
            badge: String(row.applicationStatus || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.batteries) && /\bbatter(y|ies)\b/i.test(q.asked)) {
    tasks.push(
      (async () => {
        const rows = await Battery.find(NOT_DELETED_FILTER)
          .select("batteryId status hubName chargePercentage batteryHealth")
          .sort({ updatedAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(1800);
        for (const row of rows) {
          hits.push({
            kind: "battery",
            id: String(row.batteryId || ""),
            title: String(row.batteryId || "Battery"),
            detail: `${row.status || ""} · ${row.hubName || ""} · charge ${row.chargePercentage ?? ""}%`,
            dashboard: "battery",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.hubsRead) && (searchAll || /\b(hub|yard)\b/i.test(q.asked))) {
    tasks.push(
      (async () => {
        if (!q.fuzzy && !/\b(hub|yard)\b/i.test(q.asked)) return;
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (q.fuzzy) filter.$or = [{ hubName: q.fuzzy }, { hubCode: q.fuzzy }, { city: q.fuzzy }];
        const rows = await Hub.find(filter)
          .select("hubName hubCode city status")
          .limit(8)
          .lean()
          .maxTimeMS(1800);
        for (const row of rows) {
          hits.push({
            kind: "hub",
            id: String(row.hubCode || row.hubName || ""),
            title: String(row.hubName || row.hubCode || "Hub"),
            detail: `${row.hubCode || ""} · ${row.city || ""} · ${row.status || ""}`,
            dashboard: "hub",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  await Promise.all(tasks);
  return { hits: hits.slice(0, 28), stats: stats.slice(0, 10), elapsedMs: Date.now() - started };
}
