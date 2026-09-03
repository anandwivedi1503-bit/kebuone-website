import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

export type HomeCatalogCity = {
  cityName: string;
  hubCount: number;
};

export type HomeCatalog = {
  cities: HomeCatalogCity[];
  hubCount: number;
  rates: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    rtoDaily: number;
    rtoMonths: number;
  };
  product: {
    vehicleType: string;
    vehicleModel: string;
    batteryType: string;
    gpsLive: boolean;
    availableCount: number;
  };
};

export const HOME_CATALOG_FALLBACK: HomeCatalog = {
  cities: [],
  hubCount: 0,
  rates: {
    hourly: CATALOG_RATES.Hourly,
    daily: CATALOG_RATES.Daily,
    weekly: CATALOG_RATES.Weekly,
    monthly: CATALOG_RATES.Monthly,
    rtoDaily: RTO_PLAN.dailyRate,
    rtoMonths: RTO_PLAN.tenureMonths,
  },
  product: {
    vehicleType: "Electric Scooter",
    vehicleModel: "EVUDDY Electric Scooter",
    batteryType: "Chargeable",
    gpsLive: true,
    availableCount: 0,
  },
};
