/** Published fleet-partner numbers — matches EVUDDY rider app / Fleet Partner PDF. */
export const FLEET_PARTNER_TERM_MONTHS = 48;
export const FLEET_PARTNER_MIN_FLEET = 5;
export const FLEET_PARTNER_SCALE = [5, 10, 15, 20, 30, 50, 100] as const;

export type FleetPlanId = "low" | "high";

export type FleetPlan = {
  id: FleetPlanId;
  title: string;
  perScooter: number;
  monthlyForFive: number;
};

export const FLEET_PLANS: Record<FleetPlanId, FleetPlan> = {
  low: {
    id: "low",
    title: "Low-speed EV scooter",
    perScooter: 60_000,
    monthlyForFive: 15_000,
  },
  high: {
    id: "high",
    title: "High-speed EV scooter",
    perScooter: 90_000,
    monthlyForFive: 18_000,
  },
};

export type FleetQuote = {
  plan: FleetPlan;
  fleet: number;
  investment: number;
  leftoverRupees: number;
  monthly: number;
  annual: number;
  tillTerm: number;
  monthlyPerScooter: number;
  meetsMin: boolean;
};

function monthlyForFleet(plan: FleetPlan, fleet: number) {
  const per = plan.monthlyForFive / 5;
  return Math.round(per * fleet);
}

export function quoteFromScooters(plan: FleetPlan, fleet: number): FleetQuote {
  const n = Math.max(0, Math.floor(fleet));
  const investment = plan.perScooter * n;
  const monthly = monthlyForFleet(plan, n);
  return {
    plan,
    fleet: n,
    investment,
    leftoverRupees: 0,
    monthly,
    annual: monthly * 12,
    tillTerm: monthly * FLEET_PARTNER_TERM_MONTHS,
    monthlyPerScooter: monthlyForFleet(plan, 1),
    meetsMin: n >= FLEET_PARTNER_MIN_FLEET,
  };
}

export function quoteFromRupees(plan: FleetPlan, rupees: number): FleetQuote {
  const money = Math.max(0, Math.floor(rupees));
  const fleet = plan.perScooter <= 0 ? 0 : Math.floor(money / plan.perScooter);
  const investment = plan.perScooter * fleet;
  return {
    ...quoteFromScooters(plan, fleet),
    leftoverRupees: money - investment,
  };
}

export function scaleTable(plan: FleetPlan): FleetQuote[] {
  return FLEET_PARTNER_SCALE.map((n) => quoteFromScooters(plan, n));
}

export function parseAmountInput(raw: string) {
  const cleaned = String(raw || "").replace(/\D/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
