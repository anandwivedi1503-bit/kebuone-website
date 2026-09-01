/** Published Fleet Partner Investment model (official poster on /partners). */
export const FLEET_INVESTMENT = {
  company: "Shubhurax Mobility Ltd",
  brand: "EVUDDY",
  rentalPerDay: 230,
  profitPerScooterPerDay: 87,
  investorSharePercent: 60,
  companySharePercent: 40,
  /** 60% of ₹87 */
  investorSharePerScooterPerDay: 52.2,
  scootersPerLakh: 3,
  tenureMonths: 42,
  scrapPerScooter: 6000,
  posterSrc: "/fleet-partner-poster.jpg",
  pageHref: "/partners#fleet-investment",
  posterHref: "/partners#investment-poster",
  plansHref: "/partners#investment-plans",
} as const;

export type FleetInvestmentPlan = {
  label: string;
  amount: number;
  amountLabel: string;
  scooters: number;
  scootersLabel: string;
  monthly: number;
  monthlyLabel: string;
  scrap: number;
  scrapLabel: string;
  total: number;
  totalLabel: string;
  featured: boolean;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function buildPlan(
  label: string,
  amount: number,
  scooters: number,
  featured: boolean
): FleetInvestmentPlan {
  const monthly = Math.round(
    scooters * FLEET_INVESTMENT.investorSharePerScooterPerDay * 30
  );
  const scrap = scooters * FLEET_INVESTMENT.scrapPerScooter;
  const total = monthly * FLEET_INVESTMENT.tenureMonths + scrap;
  return {
    label,
    amount,
    amountLabel: formatInr(amount),
    scooters,
    scootersLabel: `${scooters} scooters`,
    monthly,
    monthlyLabel: formatInr(monthly),
    scrap,
    scrapLabel: formatInr(scrap),
    total,
    totalLabel: formatInr(total),
    featured,
  };
}

/** Starter / Pro / Enterprise — totals match the official poster. */
export const FLEET_INVESTMENT_PLANS: FleetInvestmentPlan[] = [
  buildPlan("Starter", 100_000, 3, false),
  buildPlan("Pro", 500_000, 15, true),
  buildPlan("Enterprise", 1_000_000, 30, false),
];

export const FLEET_INVESTMENT_STARTER = FLEET_INVESTMENT_PLANS[0];

export function fleetInvestmentKnowledgeBlock() {
  const { rentalPerDay, profitPerScooterPerDay, investorSharePercent, companySharePercent, investorSharePerScooterPerDay, scootersPerLakh, tenureMonths, scrapPerScooter, company } =
    FLEET_INVESTMENT;
  const plans = FLEET_INVESTMENT_PLANS.map(
    (p) =>
      `${p.amountLabel} → ${p.scooters} scooters → ~${p.monthlyLabel}/month → total returns (${tenureMonths} months) ${p.totalLabel} (includes scrap ${p.scrapLabel})`
  ).join("; ");
  return `
FLEET PARTNER INVESTMENT (official poster on /partners#investment-poster — use these exact numbers):
- Brand EVUDDY by ${company}. Tagline: Invest today | Earn monthly | Grow together.
- You invest; EVUDDY provides and operates EV scooters; scooters rent daily.
- Rental assumption: ₹${rentalPerDay} per 24 hrs. Net profit after ops ≈ ₹${profitPerScooterPerDay} per scooter per day.
- Profit share: YOU earn ${investorSharePercent}%, company keeps ${companySharePercent}% → investor ≈ ₹${investorSharePerScooterPerDay} per scooter per day.
- ${scootersPerLakh} scooters per ₹1 lakh. Tenure ${tenureMonths} months. Scrap ≈ ₹${scrapPerScooter.toLocaleString("en-IN")} per scooter at end.
- Published plans: ${plans}.
- Example ₹1 lakh: monthly share ${FLEET_INVESTMENT_STARTER.monthlyLabel}; total after ${tenureMonths} months ${FLEET_INVESTMENT_STARTER.totalLabel}.
- Apply on /partners form. No investment payment inside Eva chat. Returns are subject to operational performance.
`.trim();
}

export function fleetInvestmentFaqHindi() {
  const p = FLEET_INVESTMENT_STARTER;
  return `फ्लीट पार्टनर निवेश आसान भाषा में: आप पैसा लगाते हैं, EVUDDY स्कूटर चलाती है। हर स्कूटर से रोज़ करीब ₹${FLEET_INVESTMENT.profitPerScooterPerDay} मुनाफा; इसमें से ${FLEET_INVESTMENT.investorSharePercent}% आपका (${FLEET_INVESTMENT.companySharePercent}% कंपनी का)। ₹1 लाख पर ${p.scooters} स्कूटर → करीब ${p.monthlyLabel} हर महीने, ${FLEET_INVESTMENT.tenureMonths} महीने में कुल रिटर्न करीब ${p.totalLabel} (स्क्रैप सहित)। प्लान: ₹1 लाख (${p.totalLabel}), ₹5 लाख (${FLEET_INVESTMENT_PLANS[1].totalLabel}), ₹10 लाख (${FLEET_INVESTMENT_PLANS[2].totalLabel})। आधिकारिक पोस्टर और फॉर्म /partners पर देखें। चैट में पैसे नहीं लिए जाते।`;
}

export function fleetInvestmentFaqEnglish() {
  const p = FLEET_INVESTMENT_STARTER;
  return `Fleet Partner Investment on /partners: you fund scooters, EVUDDY operates them. ~₹${FLEET_INVESTMENT.profitPerScooterPerDay} net profit per scooter/day; you earn ${FLEET_INVESTMENT.investorSharePercent}% (company ${FLEET_INVESTMENT.companySharePercent}%) ≈ ₹${FLEET_INVESTMENT.investorSharePerScooterPerDay}/scooter/day. ₹1 lakh = ${p.scooters} scooters → ~${p.monthlyLabel}/month; total returns in ${FLEET_INVESTMENT.tenureMonths} months ~${p.totalLabel} (incl. scrap). Plans: ₹1L (${p.totalLabel}), ₹5L (${FLEET_INVESTMENT_PLANS[1].totalLabel}), ₹10L (${FLEET_INVESTMENT_PLANS[2].totalLabel}). See the official poster and apply on the partners form — I cannot take investment money in chat.`;
}
