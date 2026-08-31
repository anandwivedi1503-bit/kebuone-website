import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/models/City";
import Hub from "@/models/Hub";
import {
  getAdminSession,
  isAdminAuthenticated,
  requireAdminDashboards,
  sessionHasAnyDashboard,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

type CityResponse = {
  _id?: unknown;
  cityName: string;
  state?: string;
  status: "Active" | "Inactive";
  isDeleted: boolean;
};

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = clean(searchParams.get("status"));

    const isAdmin = sessionHasAnyDashboard(
      await getAdminSession(),
      ...API_DASHBOARDS.citiesRead
    );

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    } else if (!isAdmin) {
      filter.status = "Active";
    }

    let cities: CityResponse[] = await City.find(filter)
  .sort({ cityName: 1 })
  .lean();

    /*
     * Fallback for older records:
     * if City collection is empty, use active hub cities.
     */
    if (cities.length === 0) {
      const hubCities = await Hub.distinct("city", {
        isDeleted: false,
        status: "Active",
        city: { $exists: true, $nin: ["", null] },
      });

      cities = hubCities
        .map((cityName) => clean(cityName))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((cityName) => ({
          _id: cityName,
          cityName,
          state: "",
          status: "Active" as const,
          isDeleted: false,
        }));
    }

    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("GET CITIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cities.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.citiesWrite);
    if (gate.error) return gate.error;

    await connectDB();

    const body = await req.json();
    const cityName = clean(body.cityName);
    const state = clean(body.state);
    const status = clean(body.status || "Active");

    if (cityName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "City name is required.",
        },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid city status.",
        },
        { status: 400 }
      );
    }

    const existing = await City.findOne({
      cityName: new RegExp(
        `^${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      ),
      isDeleted: false,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "City already exists.",
        },
        { status: 409 }
      );
    }

    const city = await City.create({
      cityName,
      state,
      status,
      isDeleted: false,
      updatedBy: "Admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "City created successfully.",
        data: city,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create city.",
      },
      { status: 500 }
    );
  }
}