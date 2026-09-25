/** Fleet partner campaign — full numbers live in the downloadable brief, not on-page calculators. */
export const FLEET_INVESTMENT = {
  company: "Shubhurax Mobility Ltd",
  brand: "EVUDDY",
  pageHref: "/partners#fleet-investment",
  posterHref: "/partners#investment-poster",
  plansHref: "/partners#fleet-investment",
  pdfHref: "/fleet-partner-investment.pdf",
  pdfFileName: "EVUDDY-Fleet-Partner-Investment.pdf",
} as const;

export function fleetInvestmentKnowledgeBlock() {
  return `
FLEET PARTNER INVESTMENT (campaign on /partners#fleet-investment):
- Brand EVUDDY by ${FLEET_INVESTMENT.company}. Tagline: Put your capital on India's yellow EV fleet.
- EVUDDY operates the scooters — hubs, KYC, GPS, charging, rider support. Partners fund fleet growth.
- Do not quote on-page calculators or old share splits. Direct people to download the official PDF (${FLEET_INVESTMENT.pdfHref}) and apply on the partners form.
- No investment payment inside Eva chat. Returns depend on operations and the signed agreement.
`.trim();
}

export function fleetInvestmentFaqHindi() {
  return `फ्लीट पार्टनर निवेश /partners पर है। पुराने कैलकुलेटर हटा दिए गए हैं — आधिकारिक डिटेल PDF में है, डाउनलोड बटन से खोलें। फिर पार्टनर्स फॉर्म पर अप्लाई करें। चैट में निवेश की रकम नहीं ली जाती।`;
}

export function fleetInvestmentFaqEnglish() {
  return `Fleet Partner Investment is on /partners as a campaign with an official PDF download — we no longer publish calculator grids on the page. Download the brief, then apply on the partners form. I cannot take investment money in chat.`;
}
