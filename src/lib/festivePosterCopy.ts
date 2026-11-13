import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

const PRICING = {
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

/** Diwali welcome poster — EVUDDY catalog rates and Lucknow-only copy. */
export const FESTIVE_POSTER = {
  kicker: "शुभ दीपावली",
  kickerEn: "Happy Diwali",
  city: "Lucknow",
  ...PRICING,
} as const;

/** Chhath Puja welcome poster — sunrise river motif, Bihar–UP cultural tone. */
export const CHHATH_POSTER = {
  kicker: "छठ पूजा",
  kickerEn: "Chhath Puja",
  city: "Lucknow",
  ...PRICING,
  hashtag: "#ChhathWithEvuddy",
  ctaPrimary: "Book EV for the ghat",
  ctaSecondary: "Continue browsing",
} as const;
