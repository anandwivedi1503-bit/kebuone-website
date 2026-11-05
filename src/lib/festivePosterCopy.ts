import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

/** Diwali welcome poster — EVUDDY catalog rates and Lucknow-only copy. */
export const FESTIVE_POSTER = {
  kicker: "शुभ दीपावली",
  kickerEn: "Happy Diwali",
  city: "Lucknow",
  left: {
    stat: String(CATALOG_RATES.Daily),
    prefix: "₹",
    line1: "Daily rent",
    line2: "GST included",
  },
  right: {
    stat: String(RTO_PLAN.dailyRate),
    prefix: "₹",
    line1: "Rent to Own",
    line2: `${RTO_PLAN.tenureMonths} months`,
  },
  footerCities: "Lucknow hubs only",
  hashtag: "#safeRideWithEvuddy",
  ctaPrimary: "Book an EV ride",
  ctaSecondary: "Continue browsing",
  tc: "T&C apply",
} as const;
