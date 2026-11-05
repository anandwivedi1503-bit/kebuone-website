import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

/** Premium Diwali poster — Zypp-style dual offer, EVUDDY catalog facts only. */
export const FESTIVE_POSTER = {
  badge: "Diwali Dhamaka",
  badgeHi: "शुभ Deepawali",
  tagline: "Smart. Electric. Mobility.",
  left: {
    stat: String(CATALOG_RATES.Daily),
    prefix: "₹",
    line1: "Pay daily rent",
    line2: "GST included · hourly to monthly",
  },
  right: {
    stat: String(RTO_PLAN.dailyRate),
    prefix: "₹",
    line1: "Rent to Own",
    line2: `${RTO_PLAN.tenureMonths} months · then yours`,
  },
  hook: "Rent by the day or pay toward ownership — your Lucknow hub.",
  footerCities: "Applicable in Lucknow only",
  footerAction: "Book EV on evuddy.com",
  hashtag: "#safeRideWithEvuddy",
  ctaPrimary: "Book an EV ride",
  ctaSecondary: "Continue browsing",
  tc: "T&C apply",
} as const;
