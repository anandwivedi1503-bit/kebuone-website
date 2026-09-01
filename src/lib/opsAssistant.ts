import { API_DASHBOARDS } from "@/lib/adminCan";
import { sessionHasAnyDashboard, type AdminSessionInfo } from "@/lib/adminAuth";
import { DASHBOARD_LABELS } from "@/lib/adminRoles";
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

export type OpsAction = {
  type: "open_dashboard";
  dashboard: string;
  label: string;
  autoNavigate?: boolean;
};

export type OpsAssistantResult = {
  answer: string;
  hits: OpsHit[];
  stats: OpsStat[];
  action?: OpsAction;
};

const DASHBOARD_ALIASES: { keys: RegExp; id: string }[] = [
  { keys: /\b(booking|bookings|yard desk|ride desk)\b/i, id: "bookings" },
  { keys: /\b(rent to own|rto)\b/i, id: "renttoown" },
  { keys: /\b(fleet)\b/i, id: "fleet" },
  { keys: /\b(vehicle|vehicles|scooter|scooters|bike management)\b/i, id: "vehicles" },
  { keys: /\b(hub management|manage hubs)\b/i, id: "hubmanagement" },
  { keys: /\b(hub dashboard|hub|yard)\b/i, id: "hub" },
  { keys: /\b(city|cities)\b/i, id: "citymanagement" },
  { keys: /\b(battery swap|swap)\b/i, id: "swap" },
  { keys: /\b(batteries|battery)\b/i, id: "battery" },
  { keys: /\b(iot|gps|tracking)\b/i, id: "iot" },
  { keys: /\b(wallet|wallets)\b/i, id: "wallet" },
  { keys: /\b(revenue)\b/i, id: "revenue" },
  { keys: /\b(partner|partners|fleet partner)\b/i, id: "partner" },
  { keys: /\b(user|users|rider|riders)\b/i, id: "users" },
  { keys: /\b(kyc)\b/i, id: "kyc" },
  { keys: /\b(support|ticket|tickets|complaint)\b/i, id: "support" },
  { keys: /\b(transaction|transactions|payments list)\b/i, id: "transactions" },
  { keys: /\b(analytics|stats board)\b/i, id: "analytics" },
  { keys: /\b(refund|refunds)\b/i, id: "refunds" },
  { keys: /\b(audit|logs)\b/i, id: "audit" },
  { keys: /\b(team|staff access)\b/i, id: "team" },
  { keys: /\b(admin home|home|overview)\b/i, id: "admin" },
];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function can(session: AdminSessionInfo, keys: readonly string[]) {
  return sessionHasAnyDashboard(session, ...keys);
}

function canOpenDashboard(session: AdminSessionInfo, dashboard: string) {
  if (session.role === "super") return true;
  return session.dashboards.includes(dashboard);
}

function hindiPreferred(language: string, question: string) {
  return language === "hi" || language === "mr" || /[\u0900-\u097F]/.test(question);
}

export function opsAssistantBlocked(question: string) {
  return /\b(pay|razorpay|upi|otp|unlock|delete permanently|transfer money|charge card)\b/i.test(
    question
  );
}

function resolveOpenDashboard(question: string): string {
  const lower = question.toLowerCase();
  const wantsOpen =
    /\b(open|go to|take me|show me|switch to|launch|खोलो|खोल)\b/i.test(question) ||
    /\b(approve|process|handle|review)\b/i.test(lower);
  if (!wantsOpen && !/\bopen\b/i.test(lower)) {
    // Still allow bare “bookings dashboard” style
    if (!/\b(dashboard|section|page|screen)\b/i.test(lower)) return "";
  }
  for (const row of DASHBOARD_ALIASES) {
    if (row.keys.test(question)) return row.id;
  }
  return "";
}

function moneyDanger(question: string) {
  return (
    opsAssistantBlocked(question) &&
    /\b(for me|do it|now|complete|enter|execute|confirm payment)\b/i.test(question)
  );
}

export async function runOpsAssistant(
  session: AdminSessionInfo,
  question: string,
  language = "auto"
): Promise<OpsAssistantResult> {
  const asked = question.trim().slice(0, 240);
  const hindi = hindiPreferred(language, asked);

  if (asked.length < 2) {
    return {
      answer: hindi
        ? "BK- ID, फोन, unpaid, in-ride, KYC, refunds पूछें — या “open bookings” कहें। भुगतान/OTP यहाँ से नहीं होगा।"
        : "Ask for a BK- ID, phone, unpaid rides, in-ride fleet, KYC queue, refunds — or say “open bookings”. I search live data for this login. I cannot pay or enter OTP.",
      hits: [],
      stats: [],
    };
  }

  if (moneyDanger(asked)) {
    const openId = resolveOpenDashboard(asked);
    const dashboard =
      openId && canOpenDashboard(session, openId)
        ? openId
        : /\brefund\b/i.test(asked)
          ? "refunds"
          : /\bkyc\b/i.test(asked)
            ? "kyc"
            : "bookings";
    return {
      answer: hindi
        ? "मैं भुगतान, OTP, अनलॉक या डिलीट नहीं कर सकता। सही डैशबोर्ड खोल रहा हूँ — वहाँ स्टाफ बटन से पूरा करें।"
        : "I cannot pay, enter OTP, unlock, or delete from chat. Opening the right dashboard — finish with the staff buttons there.",
      hits: [],
      stats: [],
      action: canOpenDashboard(session, dashboard)
        ? {
            type: "open_dashboard",
            dashboard,
            label: `Open ${DASHBOARD_LABELS[dashboard] || dashboard}`,
            autoNavigate: true,
          }
        : undefined,
    };
  }

  await connectDB();

  const lower = asked.toLowerCase();
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
  const fuzzy = token.length >= 3 ? new RegExp(token, "i") : null;

  const wantUnpaid = /\b(unpaid|pending payment|due|partial|बकाया|बाकी)\b/i.test(asked);
  const wantInRide = /\b(in ride|live ride|ongoing|on trip|राइड में)\b/i.test(asked);
  const wantRto = /\b(rto|rent to own|रेंट टू ओन)\b/i.test(asked);
  const wantAvailable = /\b(available scooter|available bike|free scooter|available fleet|उपलब्ध)\b/i.test(
    asked
  );
  const wantOpenTickets = /\b(open ticket|support|complaint|टिकट|शिकायत)\b/i.test(asked);
  const wantKyc = /\b(kyc|pending kyc|approve rider|verification)\b/i.test(asked);
  const wantRefunds = /\b(refund|refunds|deposit return)\b/i.test(asked);
  const wantCounts = /\b(how many|count|total|kitne|कितने|संख्या)\b/i.test(asked);
  const wantSummary =
    wantCounts || /\b(overview|summary|today|live status|status board)\b/i.test(asked);

  const openDashboardId = resolveOpenDashboard(asked);
  let action: OpsAction | undefined;
  if (openDashboardId && canOpenDashboard(session, openDashboardId)) {
    action = {
      type: "open_dashboard",
      dashboard: openDashboardId,
      label: `Open ${DASHBOARD_LABELS[openDashboardId] || openDashboardId}`,
      autoNavigate: /\b(open|go to|take me|switch to|launch|खोलो|खोल|approve|review|process)\b/i.test(
        asked
      ),
    };
  }

  const hits: OpsHit[] = [];
  const stats: OpsStat[] = [];
  const tasks: Array<Promise<void>> = [];

  // Live pulse stats for command-center feel
  if (wantSummary || wantCounts || wantUnpaid || wantInRide || wantOpenTickets || wantKyc || wantAvailable) {
    if (can(session, API_DASHBOARDS.bookingsRead)) {
      tasks.push(
        (async () => {
          const [unpaid, inRide, rtoDue] = await Promise.all([
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              paymentStatus: { $in: ["Pending", "Partial"] },
            }).maxTimeMS(2000),
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              rideStatus: "In Ride",
            }).maxTimeMS(2000),
            Booking.countDocuments({
              ...NOT_DELETED_FILTER,
              rentalMode: "Rent To Own",
              paymentStatus: { $in: ["Pending", "Partial"] },
            }).maxTimeMS(2000),
          ]);
          if (wantSummary || wantCounts || wantUnpaid) {
            stats.push({ label: "Unpaid", value: String(unpaid), dashboard: "bookings" });
          }
          if (wantSummary || wantCounts || wantInRide) {
            stats.push({ label: "In ride", value: String(inRide), dashboard: "fleet" });
          }
          if (wantSummary || wantCounts || wantRto) {
            stats.push({ label: "RTO due", value: String(rtoDue), dashboard: "renttoown" });
          }
        })()
      );
    }
    if (can(session, API_DASHBOARDS.tickets) && (wantSummary || wantCounts || wantOpenTickets)) {
      tasks.push(
        (async () => {
          const open = await Ticket.countDocuments({
            ...NOT_DELETED_FILTER,
            status: { $in: ["OPEN", "IN-PROGRESS"] },
          }).maxTimeMS(2000);
          stats.push({ label: "Open tickets", value: String(open), dashboard: "support" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.ridersRead) && (wantSummary || wantCounts || wantKyc)) {
      tasks.push(
        (async () => {
          const pending = await Rider.countDocuments({
            ...NOT_DELETED_FILTER,
            $or: [{ approvalStatus: "Pending" }, { status: "Pending" }],
          }).maxTimeMS(2000);
          stats.push({ label: "KYC pending", value: String(pending), dashboard: "kyc" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.vehiclesRead) && (wantSummary || wantCounts || wantAvailable)) {
      tasks.push(
        (async () => {
          const available = await Vehicle.countDocuments({
            ...NOT_DELETED_FILTER,
            vehicleStatus: "Available",
          }).maxTimeMS(2000);
          stats.push({ label: "Available", value: String(available), dashboard: "vehicles" });
        })()
      );
    }
    if (can(session, API_DASHBOARDS.refunds) && (wantSummary || wantCounts || wantRefunds)) {
      tasks.push(
        (async () => {
          const pending = await Refund.countDocuments({
            ...NOT_DELETED_FILTER,
            status: "PENDING",
          }).maxTimeMS(2000);
          stats.push({ label: "Refunds due", value: String(pending), dashboard: "refunds" });
        })()
      );
    }
  }

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
        if (!and.length && fuzzy && !wantKyc && !wantRefunds) {
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
          .select(
            "bookingId riderId userName userPhone rideStatus paymentStatus pendingAmount pickupCity startHub rentalMode vehicleId"
          )
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2500);
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

  if (can(session, API_DASHBOARDS.ridersRead) && (riderId || phone || wantKyc || fuzzy)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = {};
        const and: Record<string, unknown>[] = [{ ...NOT_DELETED_FILTER }];
        if (riderId) and.push({ riderId });
        else if (phone) and.push({ phone });
        else if (wantKyc) and.push({ $or: [{ approvalStatus: "Pending" }, { status: "Pending" }] });
        else if (fuzzy) {
          and.push({
            $or: [{ riderId: fuzzy }, { fullName: fuzzy }, { phone: fuzzy }, { email: fuzzy }],
          });
        } else return;
        filter.$and = and;
        const rows = await Rider.find(filter)
          .select("riderId fullName phone approvalStatus status bookingEnabled")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2500);
        for (const row of rows) {
          hits.push({
            kind: "rider",
            id: String(row.riderId || ""),
            title: String(row.fullName || row.riderId || "Rider"),
            detail: `${row.riderId || ""} · ${row.phone || ""} · ${row.approvalStatus || row.status || ""} · booking ${row.bookingEnabled ? "on" : "off"}`,
            dashboard: wantKyc || String(row.approvalStatus) === "Pending" ? "kyc" : "users",
            badge: String(row.approvalStatus || row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.vehiclesRead) && (wantAvailable || vehicleToken || fuzzy)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        const and: Record<string, unknown>[] = [];
        if (wantAvailable) and.push({ vehicleStatus: "Available" });
        if (vehicleToken) {
          const vFuzzy = new RegExp(escapeRegex(vehicleToken), "i");
          and.push({
            $or: [{ vehicleId: vFuzzy }, { registrationNumber: vFuzzy }],
          });
        } else if (!wantAvailable && fuzzy) {
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
          .select(
            "vehicleId registrationNumber vehicleStatus currentHub vehicleModel batteryPercentage"
          )
          .sort({ updatedAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2500);
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

  if (
    can(session, API_DASHBOARDS.tickets) &&
    (wantOpenTickets || ticketId || riderId || phone || (fuzzy && /\b(ticket|support|complaint)\b/i.test(asked)))
  ) {
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
            $or: [
              { ticketId: fuzzy },
              { bookingId: fuzzy },
              { description: fuzzy },
              { riderPhone: fuzzy },
            ],
          });
        }
        if (and.length) filter.$and = and;
        const rows = await Ticket.find(filter)
          .select("ticketId bookingId riderId status category riderPhone")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2500);
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

  if (can(session, API_DASHBOARDS.refunds) && (wantRefunds || bookingId || riderId || phone)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        const and: Record<string, unknown>[] = [];
        if (wantRefunds && !bookingId && !riderId && !phone) and.push({ status: "PENDING" });
        if (bookingId) and.push({ bookingId });
        if (riderId) and.push({ riderId });
        const rows = await Refund.find(and.length ? { ...filter, $and: and } : { ...filter, status: "PENDING" })
          .select("refundId bookingId riderId amount status")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .maxTimeMS(2500);
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

  if (can(session, API_DASHBOARDS.walletRead) && (phone || riderId || /\bwallet\b/i.test(asked))) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (riderId) filter.riderId = riderId;
        else if (phone) filter.phone = phone;
        else return;
        const rows = await Wallet.find(filter)
          .select("riderId phone balance status")
          .limit(5)
          .lean()
          .maxTimeMS(2000);
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

  if (can(session, API_DASHBOARDS.transactions) && (bookingId || /\btransaction\b/i.test(asked))) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (bookingId) filter.bookingId = bookingId;
        else if (fuzzy) filter.$or = [{ bookingId: fuzzy }, { transactionId: fuzzy }, { userName: fuzzy }];
        else return;
        const rows = await Transaction.find(filter)
          .select("transactionId bookingId userName amount status paymentMethod")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2000);
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

  if (can(session, API_DASHBOARDS.partners) && /\bpartner\b/i.test(asked) && fuzzy) {
    tasks.push(
      (async () => {
        const rows = await Partner.find({
          ...NOT_DELETED_FILTER,
          $or: [
            { organizationName: fuzzy },
            { fullName: fuzzy },
            { phone: fuzzy },
            { email: fuzzy },
          ],
        })
          .select("organizationName fullName phone applicationStatus")
          .limit(8)
          .lean()
          .maxTimeMS(2000);
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

  if (can(session, API_DASHBOARDS.batteries) && /\bbatter(y|ies)\b/i.test(asked)) {
    tasks.push(
      (async () => {
        const rows = await Battery.find(NOT_DELETED_FILTER)
          .select("batteryId status hubName chargePercentage batteryHealth")
          .sort({ updatedAt: -1 })
          .limit(8)
          .lean()
          .maxTimeMS(2000);
        for (const row of rows) {
          hits.push({
            kind: "battery",
            id: String(row.batteryId || ""),
            title: String(row.batteryId || "Battery"),
            detail: `${row.status || ""} · ${row.hubName || ""} · charge ${row.chargePercentage ?? ""}% · health ${row.batteryHealth ?? ""}%`,
            dashboard: "battery",
            badge: String(row.status || ""),
          });
        }
      })()
    );
  }

  if (can(session, API_DASHBOARDS.hubsRead) && /\b(hub|yard)\b/i.test(asked)) {
    tasks.push(
      (async () => {
        const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
        if (fuzzy) filter.$or = [{ hubName: fuzzy }, { hubCode: fuzzy }, { city: fuzzy }];
        const rows = await Hub.find(filter)
          .select("hubName hubCode city status")
          .limit(8)
          .lean()
          .maxTimeMS(2000);
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

  // Prefer a dashboard open when the admin clearly asked to open something and we have no hits
  if (action?.autoNavigate && !hits.length && !stats.length) {
    return {
      answer: hindi
        ? `${action.label} खोल रहा हूँ। संवेदनशील कदम (भुगतान / OTP / रिफंड मंज़ूरी) वहीं स्टाफ बटन से करें।`
        : `Opening ${DASHBOARD_LABELS[action.dashboard] || action.dashboard}. Sensitive steps (pay / OTP / refund approve) stay on the staff buttons there.`,
      hits: [],
      stats: [],
      action,
    };
  }

  if (!action && hits[0]?.dashboard && canOpenDashboard(session, hits[0].dashboard)) {
    action = {
      type: "open_dashboard",
      dashboard: hits[0].dashboard,
      label: `Open ${DASHBOARD_LABELS[hits[0].dashboard] || hits[0].dashboard}`,
      autoNavigate: false,
    };
  }

  // If they asked to approve KYC/refunds, open that board even with hits
  if (/\b(approve|process|review)\b/i.test(asked)) {
    if (wantKyc && canOpenDashboard(session, "kyc")) {
      action = {
        type: "open_dashboard",
        dashboard: "kyc",
        label: "Open KYC",
        autoNavigate: true,
      };
    } else if (wantRefunds && canOpenDashboard(session, "refunds")) {
      action = {
        type: "open_dashboard",
        dashboard: "refunds",
        label: "Open Refunds",
        autoNavigate: true,
      };
    }
  }

  const answer = formatOpsAnswer(asked, hits, stats, action, hindi);
  return {
    answer,
    hits: hits.slice(0, 24),
    stats: stats.slice(0, 8),
    action,
  };
}

export function formatOpsAnswer(
  question: string,
  hits: OpsHit[],
  stats: OpsStat[],
  action: OpsAction | undefined,
  hindi: boolean
) {
  const parts: string[] = [];
  if (stats.length) {
    parts.push(
      hindi
        ? `लाइव आँकड़े: ${stats.map((s) => `${s.label} ${s.value}`).join(" · ")}`
        : `Live pulse: ${stats.map((s) => `${s.label} ${s.value}`).join(" · ")}`
    );
  }
  if (hits.length) {
    const lines = hits.slice(0, 8).map((hit, index) => `${index + 1}. ${hit.title} — ${hit.detail}`);
    parts.push(
      hindi
        ? `${hits.length} रिकॉर्ड। टैप करके डैशबोर्ड खोलें।\n${lines.join("\n")}`
        : `${hits.length} match${hits.length === 1 ? "" : "es"}. Tap a card to jump.\n${lines.join("\n")}`
    );
  } else if (!stats.length && !action) {
    parts.push(
      hindi
        ? `“${question}” के लिए कुछ नहीं मिला। BK- ID, 10 अंक फोन, “unpaid”, “in ride”, “pending kyc”, “open tickets” आज़माएँ।`
        : `No matches for “${question}”. Try BK- ID, 10-digit phone, “unpaid”, “in ride”, “pending kyc”, or “open tickets”.`
    );
  }
  if (action?.autoNavigate) {
    parts.push(
      hindi
        ? `${action.label} खोल रहा हूँ।`
        : `${action.label} now.`
    );
  }
  parts.push(
    hindi
      ? "भुगतान, OTP, अनलॉक या रिफंड मंज़ूरी चैट से नहीं — डैशबोर्ड बटन से।"
      : "Pay, OTP, unlock, and refund approval stay on dashboard buttons — not in chat."
  );
  return parts.join("\n\n");
}

/** @deprecated use runOpsAssistant */
export async function searchOpsRecords(session: AdminSessionInfo, question: string) {
  const result = await runOpsAssistant(session, question, "en");
  return result.hits;
}
