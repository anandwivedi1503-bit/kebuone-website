import type { AdminSessionInfo } from "@/lib/adminAuth";

export function sessionCanOpen(
  session: AdminSessionInfo | null,
  dashboard: string
) {
  if (!session) return false;
  if (session.role === "super") return true;
  return session.dashboards.includes(dashboard);
}

/** Dashboards that already call each ops API — keep yard/fleet working. */
export const API_DASHBOARDS = {
  bookingsRead: ["bookings", "fleet", "hub", "admin", "renttoown"],
  bookingsWrite: ["bookings", "renttoown"],
  yardRide: ["bookings", "fleet", "hub"],
  cashCollect: ["bookings"],
  cashHandover: ["transactions"],
  vehiclesWrite: ["vehicles", "fleet"],
  vehiclesRead: ["vehicles", "fleet", "hub", "battery", "swap", "iot", "bookings", "admin"],
  hubsWrite: ["hubmanagement"],
  hubsRead: ["hub", "hubmanagement", "fleet", "vehicles", "bookings", "admin"],
  citiesWrite: ["citymanagement"],
  citiesRead: ["citymanagement", "hubmanagement", "admin"],
  walletRead: ["wallet", "revenue"],
  walletWrite: ["wallet"],
  transactions: ["transactions", "revenue"],
  refunds: ["refunds", "support"],
  tickets: ["support"],
  ridersRead: ["users", "kyc", "admin", "bookings"],
  ridersWrite: ["users", "kyc"],
  batteries: ["battery", "swap"],
  swaps: ["swap"],
  iot: ["iot"],
  partners: ["partner"],
  analytics: ["analytics", "admin"],
  audit: ["audit"],
} as const;
