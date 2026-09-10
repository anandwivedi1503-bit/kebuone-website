import { DEALER_TYPE, DISTRIBUTOR_TYPE } from "@/lib/dealerProgram";

export const FLIPKART_MINUTES_TYPE = "Flipkart Minutes Partner";
export const ZOMATO_TYPE = "Zomato Partner";
export const FLEET_INVESTMENT_TYPE = "Fleet Partner Investment";

export type PartnerSegmentId =
  | "ALL"
  | "FLIPKART"
  | "ZOMATO"
  | "FLEET_INVEST"
  | "DEALER"
  | "DISTRIBUTOR";

export const PARTNER_SEGMENTS: Array<{
  id: PartnerSegmentId;
  label: string;
  subtitle: string;
  icon: string;
  color: "pink" | "green" | "blue" | "yellow" | "red" | "purple";
  types: string[];
  keywords: string[];
}> = [
  {
    id: "FLIPKART",
    label: "Flipkart Minutes",
    subtitle: "Delivery leads",
    icon: "📦",
    color: "yellow",
    types: [FLIPKART_MINUTES_TYPE],
    keywords: ["flipkart"],
  },
  {
    id: "ZOMATO",
    label: "Zomato",
    subtitle: "Delivery leads",
    icon: "🍽️",
    color: "red",
    types: [ZOMATO_TYPE],
    keywords: ["zomato"],
  },
  {
    id: "FLEET_INVEST",
    label: "Fleet investment",
    subtitle: "Scooter plans",
    icon: "💰",
    color: "purple",
    types: [FLEET_INVESTMENT_TYPE],
    keywords: ["fleet partner investment", "investment plan"],
  },
  {
    id: "DEALER",
    label: "Dealers",
    subtitle: "Retail",
    icon: "🏪",
    color: "green",
    types: [DEALER_TYPE],
    keywords: [],
  },
  {
    id: "DISTRIBUTOR",
    label: "Distributors",
    subtitle: "Wholesale",
    icon: "🚛",
    color: "blue",
    types: [DISTRIBUTOR_TYPE],
    keywords: [],
  },
];

function haystack(partner: {
  partnerType?: string;
  organizationName?: string;
  message?: string;
  territory?: string;
}) {
  return [
    partner.partnerType,
    partner.organizationName,
    partner.message,
    partner.territory,
  ]
    .join(" ")
    .toLowerCase();
}

export function partnerMatchesSegment(
  partner: {
    partnerType?: string;
    organizationName?: string;
    message?: string;
    territory?: string;
  },
  segmentId: PartnerSegmentId
) {
  if (segmentId === "ALL") return true;
  const segment = PARTNER_SEGMENTS.find((item) => item.id === segmentId);
  if (!segment) return true;
  const type = String(partner.partnerType || "");
  if (segment.types.includes(type)) return true;
  const text = haystack(partner);
  return segment.keywords.some((word) => word && text.includes(word));
}

export function partnerSheetRows(
  partners: Array<Record<string, unknown>>
) {
  return partners.map((partner) => ({
    Name: partner.fullName || "",
    Organization: partner.organizationName || "",
    Channel: partner.partnerType || "",
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
