/** Fleet partner campaign and the investment options printed in the official brief. */
export const FLEET_INVESTMENT = {
  company: "Shubhurax Mobility Ltd",
  brand: "EVUDDY",
  pageHref: "/partners#fleet-investment",
  posterHref: "/partners#investment-poster",
  plansHref: "/partners#fleet-investment",
  pdfHref: "/fleet-partner-investment.pdf",
  pdfFileName: "EVUDDY-Fleet-Partner-Investment.pdf",
  posterSrc: "/fleet-partner-poster-new.png",
} as const;

export const FLEET_SIZE_OPTIONS = [5, 10, 15, 20, 30, 50, 100] as const;

export const FLEET_APPLICANT_PROFILES = [
  "Individual investor",
  "Business owner",
  "Entrepreneur",
  "Existing fleet owner",
] as const;

export const FLEET_VEHICLE_PLANS = {
  "Low-speed EV scooter": { perScooter: 60_000, monthlyReturnForFive: 15_000 },
  "High-speed EV scooter": { perScooter: 90_000, monthlyReturnForFive: 18_000 },
} as const;

export type FleetVehiclePlan = keyof typeof FLEET_VEHICLE_PLANS;

export function fleetInvestmentEstimate(vehiclePlan: FleetVehiclePlan, fleetSize: number) {
  if (!(FLEET_SIZE_OPTIONS as readonly number[]).includes(fleetSize)) return null;
  const plan = FLEET_VEHICLE_PLANS[vehiclePlan];
  if (!plan) return null;
  return {
    investment: plan.perScooter * fleetSize,
    indicativeMonthlyReturn: (plan.monthlyReturnForFive * fleetSize) / 5,
  };
}

export function formatFleetRupees(amount: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function fleetInvestmentKnowledgeBlock() {
  return `
FLEET PARTNER INVESTMENT (campaign on /partners#fleet-investment):
- Brand EVUDDY by ${FLEET_INVESTMENT.company}. Tagline: Put your capital on India's yellow EV fleet.
- EVUDDY operates the scooters — hubs, KYC, GPS, charging, rider support. Partners fund fleet growth.
- The official PDF's fleet options are low-speed scooters at ₹60,000 each and high-speed scooters at ₹90,000 each, with a minimum fleet of 5. The PDF lists fleet sizes 5, 10, 15, 20, 30, 50, and 100.
- The PDF's monthly return figures are indicative, calculated proportionally from the stated five-scooter return, and subject to the final Fleet Partner Agreement. Do not describe them as guaranteed.
- Direct people to download the official PDF (${FLEET_INVESTMENT.pdfHref}) and apply on the partners form. No investment payment inside Eva chat.
`.trim();
}

export function fleetInvestmentFaqHindi() {
  return `फ्लीट पार्टनर निवेश /partners पर उपलब्ध है। फॉर्म में आधिकारिक PDF के लो-स्पीड और हाई-स्पीड स्कूटर प्लान और 5 से 100 स्कूटर के विकल्प हैं। दिखाई गई निवेश और मासिक रिटर्न राशि अनुमानित है; अंतिम शर्तें Fleet Partner Agreement में तय होंगी। PDF डाउनलोड करके फॉर्म भरें। चैट में निवेश की रकम नहीं ली जाती।`;
}

export function fleetInvestmentFaqEnglish() {
  return `Fleet Partner Investment is on /partners with the options shown in the official PDF. Investment and monthly return estimates are indicative; final terms are set by the Fleet Partner Agreement. Download the brief, then apply on the partners form. I cannot take investment money in chat.`;
}
