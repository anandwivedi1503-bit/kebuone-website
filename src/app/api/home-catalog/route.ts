import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/models/City";
import Hub from "@/models/Hub";
import Vehicle from "@/models/Vehicle";
import {
  catalogRate,
  CATALOG_RATES,
  rtoDailyRate,
  rtoTenureMonths,
} from "@/lib/rentalPlans";
import { HOME_CATALOG_FALLBACK, type HomeCatalog } from "@/lib/homeCatalog";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function minRate(
  values: number[],
  fallback: number
) {
  const positive = values.filter((n) => Number.isFinite(n) && n > 0);
  return positive.length ? Math.min(...positive) : fallback;
}

function mostCommon(values: string[], fallback: string) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = clean(value);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = fallback;
  let bestN = 0;
  for (const [key, n] of counts) {
    if (n > bestN) {
      best = key;
      bestN = n;
    }
  }
  return best;
}

export async function GET() {
  try {
    await connectDB();

    const [cityDocs, hubs, vehicles] = await Promise.all([
      City.find({ isDeleted: false, status: "Active" })
        .sort({ cityName: 1 })
        .select("cityName")
        .lean(),
      Hub.find({
        status: "Active",
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      })
        .select("city hubName")
        .lean(),
      Vehicle.find({
        $and: [
          { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] },
          { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
          { $or: [{ vehicleStatus: "Available" }, { vehicleStatus: "available" }] },
        ],
      })
        .select(
          "hourlyRate dailyRate weeklyRate monthlyRate rentToOwnDailyRate rentToOwnMonths vehicleType vehicleModel batteryType gpsStatus"
        )
        .limit(500)
        .lean(),
    ]);

    let cityNames = cityDocs.map((row) => clean(row.cityName)).filter(Boolean);
    if (cityNames.length === 0) {
      cityNames = [
        ...new Set(
          hubs
            .map((hub) => clean(hub.city))
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));
    }

    const hubCountByCity = new Map<string, number>();
    for (const hub of hubs) {
      const city = clean(hub.city);
      if (!city) continue;
      const key = city.toLowerCase();
      hubCountByCity.set(key, (hubCountByCity.get(key) || 0) + 1);
    }

    const cities = cityNames.map((cityName) => ({
      cityName,
      hubCount: hubCountByCity.get(cityName.toLowerCase()) || 0,
    }));

    const catalog: HomeCatalog = {
      cities,
      hubCount: hubs.length,
      rates: {
        hourly: minRate(
          vehicles.map((row) => catalogRate("Hourly", row.hourlyRate)),
          CATALOG_RATES.Hourly
        ),
        daily: minRate(
          vehicles.map((row) => catalogRate("Daily", row.dailyRate)),
          CATALOG_RATES.Daily
        ),
        weekly: minRate(
          vehicles.map((row) => catalogRate("Weekly", row.weeklyRate)),
          CATALOG_RATES.Weekly
        ),
        monthly: minRate(
          vehicles.map((row) => catalogRate("Monthly", row.monthlyRate)),
          CATALOG_RATES.Monthly
        ),
        rtoDaily: rtoDailyRate(),
        rtoMonths: rtoTenureMonths(
          vehicles.find((row) => Number(row.rentToOwnMonths) > 0)?.rentToOwnMonths
        ),
      },
      product: {
        vehicleType: mostCommon(
          vehicles.map((row) => String(row.vehicleType || "")),
          HOME_CATALOG_FALLBACK.product.vehicleType
        ),
        vehicleModel: mostCommon(
          vehicles.map((row) => String(row.vehicleModel || "")),
          HOME_CATALOG_FALLBACK.product.vehicleModel
        ),
        batteryType: mostCommon(
          vehicles.map((row) => String(row.batteryType || "")),
          HOME_CATALOG_FALLBACK.product.batteryType
        ),
        gpsLive: vehicles.some((row) => String(row.gpsStatus || "") === "ONLINE"),
        availableCount: vehicles.length,
      },
    };

    return NextResponse.json({ success: true, data: catalog });
  } catch (error) {
    console.error("HOME CATALOG GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch catalog.", data: HOME_CATALOG_FALLBACK },
      { status: 500 }
    );
  }
}
