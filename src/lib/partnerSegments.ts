import { DEALER_TYPE, DISTRIBUTOR_TYPE } from "@/lib/dealerProgram";

export const FLIPKART_MINUTES_TYPE = "Flipkart Minutes Partner";
export const ZOMATO_TYPE = "Zomato Partner";
export const FLEET_INVESTMENT_TYPE = "Fleet Partner Investment";

export const DIRECT_THROUGH = "Direct / EVUDDY";

export const COMING_THROUGH_OPTIONS = [
  DIRECT_THROUGH,
  "Flipkart Minutes",
  "Zomato",
  "Swiggy",
  "Instamart",
  "Blinkit",
  "Zepto",
  "Other",
] as const;

export type ComingThrough = (typeof COMING_THROUGH_OPTIONS)[number];

export type PartnerSegmentId =
  | "ALL"
  | "DIRECT"
  | "FLIPKART"
  | "ZOMATO"
  | "SWIGGY"
  | "INSTAMART"
  | "BLINKIT"
  | "ZEPTO"
  | "OTHER_NETWORK"
  | "FLEET_INVEST"
  | "DEALER"
  | "DISTRIBUTOR";

type PartnerLike = {
  partnerType?: string;
  comingThrough?: string;
  organizationName?: string;
  message?: string;
  territory?: string;
};

export const PARTNER_SEGMENTS: Array<{
  id: PartnerSegmentId;
  label: string;
  subtitle: string;
  icon: string;
  color: "pink" | "green" | "blue" | "yellow" | "red" | "purple";
  kind: "network" | "role";
  comingThrough?: ComingThrough;
  types?: string[];
}> = [
  {
    id: "DIRECT",
    label: "Direct / EVUDDY",
    subtitle: "Own channel",
    icon: "🏠",
    color: "pink",
    kind: "network",
    comingThrough: DIRECT_THROUGH,
  },
  {
    id: "FLIPKART",
    label: "Flipkart Minutes",
    subtitle: "Tied-up network",
    icon: "📦",
    color: "yellow",
    kind: "network",
    comingThrough: "Flipkart Minutes",
  },
  {
    id: "ZOMATO",
    label: "Zomato",
    subtitle: "Tied-up network",
    icon: "🍽️",
    color: "red",
    kind: "network",
    comingThrough: "Zomato",
  },
  {
    id: "SWIGGY",
    label: "Swiggy",
    subtitle: "Tied-up network",
    icon: "🛵",
    color: "yellow",
    kind: "network",
    comingThrough: "Swiggy",
  },
  {
    id: "INSTAMART",
    label: "Instamart",
    subtitle: "Tied-up network",
    icon: "🛒",
    color: "blue",
    kind: "network",
    comingThrough: "Instamart",
  },
  {
    id: "BLINKIT",
    label: "Blinkit",
    subtitle: "Tied-up network",
    icon: "⚡",
    color: "yellow",
    kind: "network",
    comingThrough: "Blinkit",
  },
  {
    id: "ZEPTO",
    label: "Zepto",
    subtitle: "Tied-up network",
    icon: "⏱️",
    color: "purple",
    kind: "network",
    comingThrough: "Zepto",
  },
  {
    id: "OTHER_NETWORK",
    label: "Other",
    subtitle: "Tied-up network",
    icon: "🔗",
    color: "blue",
    kind: "network",
    comingThrough: "Other",
  },
  {
    id: "FLEET_INVEST",
    label: "Fleet investment",
    subtitle: "Role",
    icon: "💰",
    color: "purple",
    kind: "role",
    types: [FLEET_INVESTMENT_TYPE],
  },
  {
    id: "DEALER",
    label: "Dealers",
    subtitle: "Role",
    icon: "🏪",
    color: "green",
    kind: "role",
    types: [DEALER_TYPE],
  },
  {
    id: "DISTRIBUTOR",
    label: "Distributors",
    subtitle: "Role",
    icon: "🚛",
    color: "blue",
    kind: "role",
    types: [DISTRIBUTOR_TYPE],
  },
];

function haystack(partner: PartnerLike) {
  return [
    partner.comingThrough,
    partner.partnerType,
    partner.organizationName,
    partner.message,
    partner.territory,
  ]
    .join(" ")
    .toLowerCase();
}

export function normalizeComingThrough(partner: PartnerLike): ComingThrough {
  const saved = String(partner.comingThrough || "").trim();
  if ((COMING_THROUGH_OPTIONS as readonly string[]).includes(saved)) {
    return saved as ComingThrough;
  }
  const type = String(partner.partnerType || "");
  if (type === FLIPKART_MINUTES_TYPE) return "Flipkart Minutes";
  if (type === ZOMATO_TYPE) return "Zomato";
  const text = haystack(partner);
  if (text.includes("flipkart")) return "Flipkart Minutes";
  if (text.includes("zomato")) return "Zomato";
  if (text.includes("instamart")) return "Instamart";
  if (text.includes("blinkit")) return "Blinkit";
  if (text.includes("zepto")) return "Zepto";
  if (text.includes("swiggy")) return "Swiggy";
  return DIRECT_THROUGH;
}

export function partnerMatchesSegment(partner: PartnerLike, segmentId: PartnerSegmentId) {
  if (segmentId === "ALL") return true;
  const segment = PARTNER_SEGMENTS.find((item) => item.id === segmentId);
  if (!segment) return true;
  if (segment.kind === "network") {
    return normalizeComingThrough(partner) === segment.comingThrough;
  }
  const type = String(partner.partnerType || "");
  return Boolean(segment.types?.includes(type));
}

export const RIDER_NETWORK_SEGMENTS = PARTNER_SEGMENTS.filter(
  (segment) => segment.kind === "network"
);

export function riderMatchesNetwork(
  rider: { comingThrough?: string },
  segmentId: PartnerSegmentId
) {
  if (segmentId === "ALL") return true;
  return partnerMatchesSegment({ comingThrough: rider.comingThrough }, segmentId);
}

export function riderSheetRows(riders: Array<Record<string, unknown>>) {
  return riders.map((rider) => ({
    RiderID: rider.riderId || "",
    Name: rider.fullName || "",
    Phone: rider.phone || "",
    Email: rider.email || "",
    ComingThrough: normalizeComingThrough(rider),
    KYC: rider.kycStatus || rider.approvalStatus || "",
    Status: rider.status || "",
    Submitted: rider.createdAt || "",
  }));
}

export function partnerSheetRows(partners: Array<Record<string, unknown>>) {
  return partners.map((partner) => ({
    Name: partner.fullName || "",
    Organization: partner.organizationName || "",
    Role: partner.partnerType || "",
    ComingThrough: normalizeComingThrough(partner),
    Phone: partner.phone || "",
    Email: partner.email || "",
    City: partner.city || "",
    State: partner.state || "",
    Territory: partner.territory || "",
    Investment: partner.investmentCapacity || "",
    Status: partner.applicationStatus || "",
    Stage: partner.applicationStage || "",
    Notes: partner.adminRemarks || "",
    Message: partner.message || "",
  }));
}
