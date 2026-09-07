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

    const [cityDocs, hubStats, vehicles] = await Promise.all([
      City.find({ isDeleted: false, status: "Active" })
        .sort({ cityName: 1 })
        .select("cityName")
        .lean(),
      Hub.aggregate([
        {
          $match: {
            status: "Active",
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
          },
        },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$city", ""] } },
            city: { $first: "$city" },
            n: { $sum: 1 },
          },
        },
      ]),
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
      cityNames = hubStats
        .map((row: { city?: string }) => clean(row.city))
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));
    }

    const hubCountByCity = new Map<string, number>();
    let hubCount = 0;
    for (const row of hubStats as Array<{ _id?: string; n?: number }>) {
      const key = clean(row._id);
      const n = Number(row.n || 0);
      if (!key) continue;
      hubCountByCity.set(key, n);
      hubCount += n;
    }

    const cities = cityNames.map((cityName) => ({
      cityName,
      hubCount: hubCountByCity.get(cityName.toLowerCase()) || 0,
    }));

    const catalog: HomeCatalog = {
      cities,
      hubCount,
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
    return NextResponse.json({
      success: true,
      data: HOME_CATALOG_FALLBACK,
    });
  }
}
