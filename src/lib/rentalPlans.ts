export const CATALOG_RATES = {
  Hourly: 60,
  Daily: 250,
  Weekly: 1750,
  Monthly: 7500,
} as const;

/** Refundable security deposit on rentals and Rent to Own. GST is not charged on deposit. */
export const COMPANY_SECURITY_DEPOSIT = 2500;

export const RTO_PLAN = {
  dailyRate: 300,
  tenureMonths: 18,
  billingDays: 1,
  securityDeposit: COMPANY_SECURITY_DEPOSIT,
} as const;

export function moneyRate(value: unknown, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : fallback;
}

/** Published GST-inclusive list prices. Vehicle rows cannot undercut the catalog. */
export function catalogRate(
  mode: keyof typeof CATALOG_RATES,
  _vehicleRate?: unknown
) {
  return CATALOG_RATES[mode];
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

export function rtoContractDays(months?: unknown) {
  return rtoTenureMonths(months) * 30;
}

export function rtoContractValue(vehicleDailyRate?: unknown, months?: unknown) {
  return rtoDailyRate(vehicleDailyRate) * rtoContractDays(months);
}
