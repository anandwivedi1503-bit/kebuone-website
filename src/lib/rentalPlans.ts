export const CATALOG_RATES = {
  Hourly: 60,
  Daily: 230,
  Weekly: 1610,
  Monthly: 6900,
} as const;

export const RTO_PLAN = {
  dailyRate: 280,
  tenureMonths: 18,
  billingDays: 30,
} as const;

export function moneyRate(value: unknown, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : fallback;
}

export function catalogRate(
  mode: keyof typeof CATALOG_RATES,
  vehicleRate?: unknown
) {
  return moneyRate(vehicleRate, CATALOG_RATES[mode]);
}

export function rtoDailyRate(_vehicleRate?: unknown) {
  return RTO_PLAN.dailyRate;
}

export function rtoTenureMonths(vehicleMonths?: unknown) {
  const months = Number(vehicleMonths);
  return Number.isInteger(months) && months > 0
    ? months
    : RTO_PLAN.tenureMonths;
}

export function rtoInstallment(_vehicleDailyRate?: unknown) {
  return rtoDailyRate();
}

export function rtoContractValue(vehicleDailyRate?: unknown, months?: unknown) {
  return (
    rtoDailyRate(vehicleDailyRate) *
    RTO_PLAN.billingDays *
    rtoTenureMonths(months)
  );
}
