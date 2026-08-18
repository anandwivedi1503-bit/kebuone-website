export const ALL_DASHBOARDS = [
  "admin",
  "fleet",
  "vehicles",
  "hub",
  "hubmanagement",
  "citymanagement",
  "battery",
  "swap",
  "iot",
  "wallet",
  "revenue",
  "partner",
  "users",
  "kyc",
  "support",
  "bookings",
  "renttoown",
  "transactions",
  "analytics",
  "refunds",
  "audit",
  "team",
] as const;

export type DashboardId = (typeof ALL_DASHBOARDS)[number];

export const DASHBOARD_LABELS: Record<string, string> = {
  admin: "Admin home",
  fleet: "Fleet",
  vehicles: "Vehicle management",
  hub: "Hub dashboard",
  hubmanagement: "Hub management",
  citymanagement: "City management",
  battery: "Batteries",
  swap: "Battery swap",
  iot: "IoT",
  wallet: "Wallet",
  revenue: "Revenue",
  partner: "Partners",
  users: "Users",
  kyc: "KYC",
  support: "Support",
  bookings: "Bookings",
  renttoown: "Rent to Own",
  transactions: "Transactions",
  analytics: "Analytics",
  refunds: "Refunds",
  audit: "Audit logs",
  team: "Team access",
};

export const STAFF_DASHBOARDS: string[] = ALL_DASHBOARDS.filter(
  (id) => id !== "team"
);
