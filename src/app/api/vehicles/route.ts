import {
  getAdminSession,
  isAdminAuthenticated,
  requireAdminDashboards,
  sessionHasAnyDashboard,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Vehicle from "@/models/Vehicle";
import Hub, {
  IHub,
} from "@/models/Hub";
import {
  CATALOG_RATES,
  COMPANY_SECURITY_DEPOSIT,
  catalogRate,
  rtoDailyRate,
  rtoTenureMonths,
} from "@/lib/rentalPlans";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import { effectiveGpsStatus, hasRecentVehiclePing } from "@/lib/vehicleTelemetry";
import {
  applyCreatedCursor,
  listResponseFromPage,
  parseListQuery,
  withNextCursor,
} from "@/lib/listQuery";

const registrationTypes = [
  "RTO",
  "Non-RTO",
];

const vehicleTypes = [
  "Electric Scooter",
  "Electric Bike",
  "Delivery Bike",
];

const batteryTypes = [
  "Chargeable",
  "Swappable",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function upper(value: unknown) {
  return clean(value).toUpperCase();
}

function optionalDate(value: unknown) {
  const text = clean(value);

  if (!text) {
    return undefined;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function numberOrDefault(
  value: unknown,
  defaultValue: number
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : NaN;
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.vehiclesWrite);
    if (gate.error) return gate.error;

    await connectDB();

    const body = await req.json();

    const vehicleId = upper(body.vehicleId);
    const registrationNumber =
      upper(body.registrationNumber);

    const chassisNumber =
      upper(body.chassisNumber);

    const vehicleModel =
      clean(body.vehicleModel);

    const requestedHub =
      upper(body.currentHub);

    const registrationType =
      clean(body.registrationType || "RTO");

    const vehicleType =
      clean(
        body.vehicleType ||
          "Electric Scooter"
      );

    const batteryType =
      clean(
        body.batteryType ||
          "Chargeable"
      );

    const errors: string[] = [];

    if (vehicleId.length < 3) {
      errors.push(
        "Vehicle ID is required."
      );
    }

    if (registrationNumber.length < 3) {
      errors.push(
        "Registration Number is required."
      );
    }

    if (chassisNumber.length < 5) {
      errors.push(
        "Valid chassis number is required."
      );
    }

    if (vehicleModel.length < 2) {
      errors.push(
        "Vehicle Model is required."
      );
    }

    if (!requestedHub) {
      errors.push(
        "Current Hub is required."
      );
    }

    if (
      !registrationTypes.includes(
        registrationType
      )
    ) {
      errors.push(
        "Invalid registration type."
      );
    }

    if (
      !vehicleTypes.includes(
        vehicleType
      )
    ) {
      errors.push(
        "Invalid vehicle type."
      );
    }

    if (
      !batteryTypes.includes(
        batteryType
      )
    ) {
      errors.push(
        "Invalid battery type."
      );
    }

    // Battery state comes from the authenticated device, never a registration form.
    const batteryPercentage = null;

    const hourlyRate =
      numberOrDefault(
        body.hourlyRate,
        CATALOG_RATES.Hourly
      );

    const dailyRate =
      numberOrDefault(
        body.dailyRate,
        CATALOG_RATES.Daily
      );

    const weeklyRate =
      numberOrDefault(
        body.weeklyRate,
        CATALOG_RATES.Weekly
      );

    const monthlyRate =
      numberOrDefault(
        body.monthlyRate,
        CATALOG_RATES.Monthly
      );

    const securityDeposit =
      numberOrDefault(
        body.securityDeposit,
        COMPANY_SECURITY_DEPOSIT
      );

    const rentToOwnDailyRate =
      numberOrDefault(
        body.rentToOwnDailyRate,
        rtoDailyRate()
      );

    const rentToOwnMonths =
      numberOrDefault(
        body.rentToOwnMonths,
        18
      );

    const odometer =
      numberOrDefault(
        body.odometer,
        0
      );

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate < 0
    ) {
      errors.push(
        "Hourly rate must be valid."
      );
    }

    if (
      !Number.isFinite(dailyRate) ||
      dailyRate < 0
    ) {
      errors.push(
        "Daily rate must be valid."
      );
    }

    if (
      !Number.isFinite(weeklyRate) ||
      weeklyRate < 0
    ) {
      errors.push(
        "Weekly rate must be valid."
      );
    }

    if (
      !Number.isFinite(monthlyRate) ||
      monthlyRate < 0
    ) {
      errors.push(
        "Monthly rate must be valid."
      );
    }

    if (
      !Number.isFinite(
        securityDeposit
      ) ||
      securityDeposit < 0
    ) {
      errors.push(
        "Security deposit must be valid."
      );
    }

    if (
      !Number.isFinite(odometer) ||
      odometer < 0
    ) {
      errors.push(
        "Odometer must be valid."
      );
    }

    // GPS state must come from an authenticated device ping, never the form.
    const gpsStatus = "OFFLINE";

    const lastServiceDate =
      optionalDate(
        body.lastServiceDate
      );

    const insuranceExpiry =
      optionalDate(
        body.insuranceExpiry
      );

    const fitnessExpiry =
      optionalDate(
        body.fitnessExpiry
      );

    const pollutionExpiry =
      optionalDate(
        body.pollutionExpiry
      );

    if (
      lastServiceDate === null ||
      insuranceExpiry === null ||
      fitnessExpiry === null ||
      pollutionExpiry === null
    ) {
      errors.push(
        "One or more vehicle dates are invalid."
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    /*
     * Resolve hub by either Hub Code or Hub Name.
     *
     * New vehicles always store hubCode.
     */
    const hub = await Hub.findOne({
      isDeleted: false,
      status: {
        $in: [
          "Active",
          "Maintenance",
        ],
      },
      $or: [
        {
          hubCode:
            requestedHub,
        },
        {
          hubName:
            clean(body.currentHub),
        },
      ],
   }).lean<IHub | null>();

    if (!hub) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Selected hub does not exist or is not operational.",
          ],
        },
        { status: 400 }
      );
    }

    /*
     * Prevent duplicate vehicle records.
     */
    const existingVehicle =
      await Vehicle.findOne({
        $or: [
          { vehicleId },
          {
            registrationNumber,
          },
          {
            chassisNumber,
          },
        ],
      }).lean();

    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Vehicle ID, Registration Number, or Chassis Number already exists.",
          ],
        },
        { status: 409 }
      );
    }

    /*
     * Backend controls initial operational state.
     *
     * Client is NOT allowed to decide this.
     */
    const vehicleStatus = "Available" as const;

    /*
     * Only explicitly allowed fields
     * are written to MongoDB.
     */
    const vehicle =
      await Vehicle.create({
        vehicleId,

        registrationNumber,

        registrationType,

        chassisNumber,

        vehicleType,

        vehicleModel,

        batteryType,

        hourlyRate,

        dailyRate,

        weeklyRate,

        monthlyRate,

        rentToOwnDailyRate,

        rentToOwnMonths,

        securityDeposit,

        odometer,

        batteryPercentage,

        gpsStatus,

        lockStatus: "Locked",

        /*
         * ALWAYS store Hub Code.
         */
        currentHub:
          hub.hubCode,

        vehicleStatus,

        /*
         * Operational assignment is
         * controlled by future booking/
         * assignment modules.
         */
        assignedRider: "",

        currentBookingId: "",

        currentRiderId: "",

        pickupOTPVerified:
          false,

        isActive: true,

        isDeleted: false,

        remarks:
          clean(body.remarks),

        lastServiceDate,

        insuranceExpiry,

        fitnessExpiry,

        pollutionExpiry,

        updatedBy: "Admin",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Vehicle created successfully.",
        data: vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "VEHICLE CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create vehicle.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getAdminSession();
    const isAdmin = sessionHasAnyDashboard(
      session,
      ...API_DASHBOARDS.vehiclesRead
    );

    if (isAdmin) {
      const filter: Record<string, unknown> = {
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      };
      applyHubScope(filter, await resolveHubScope(session), ["currentHub"]);
      const { page, limit, skip, cursor } = parseListQuery(req);
      const query = new URL(req.url).searchParams;
      const pageRequested = query.has("limit") || query.has("page") || query.has("cursor");
      const pageLimit = pageRequested ? limit : 500;
      const summaryFilter = { ...filter };
      applyCreatedCursor(filter, cursor);
      const freshSince = new Date(Date.now() - 15 * 60 * 1000);
      const [vehicleRows, summaryRows] = await Promise.all([
        Vehicle.find(filter)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(cursor ? 0 : skip)
        .limit(pageLimit + 1)
        .lean(),
        cursor ? Promise.resolve([]) : Vehicle.aggregate([
          {
            $match: summaryFilter,
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              available: { $sum: { $cond: [{ $eq: ["$vehicleStatus", "Available"] }, 1, 0] } },
              inRide: { $sum: { $cond: [{ $eq: ["$vehicleStatus", "In Ride"] }, 1, 0] } },
              maintenance: { $sum: { $cond: [{ $eq: ["$vehicleStatus", "Maintenance"] }, 1, 0] } },
              lowBattery: { $sum: { $cond: [{ $and: [{ $gte: ["$lastPingTime", freshSince] }, { $lt: ["$batteryPercentage", 20] }] }, 1, 0] } },
              rto: { $sum: { $cond: [{ $eq: ["$registrationType", "RTO"] }, 1, 0] } },
              online: { $sum: { $cond: [{ $and: [{ $gte: ["$lastPingTime", freshSince] }, { $eq: [{ $toUpper: { $ifNull: ["$gpsStatus", ""] } }, "ONLINE"] }] }, 1, 0] } },
              locked: { $sum: { $cond: [{ $and: [{ $gte: ["$lastPingTime", freshSince] }, { $eq: [{ $toUpper: { $ifNull: ["$lockStatus", ""] } }, "LOCKED"] }] }, 1, 0] } },
            },
          },
        ]),
      ]);
      const payload = listResponseFromPage(
        vehicleRows.map((vehicle) => {
          const telemetryFresh = hasRecentVehiclePing(vehicle.lastPingTime);
          return {
            ...vehicle,
            gpsStatus: effectiveGpsStatus(vehicle.gpsStatus, vehicle.lastPingTime),
            telemetryFresh,
            batteryPercentage: telemetryFresh ? vehicle.batteryPercentage : null,
            currentLatitude: telemetryFresh ? vehicle.currentLatitude : null,
            currentLongitude: telemetryFresh ? vehicle.currentLongitude : null,
            hourlyRate: catalogRate("Hourly", vehicle.hourlyRate),
            dailyRate: catalogRate("Daily", vehicle.dailyRate),
            weeklyRate: catalogRate("Weekly", vehicle.weeklyRate),
            monthlyRate: catalogRate("Monthly", vehicle.monthlyRate),
            rentToOwnDailyRate: rtoDailyRate(vehicle.rentToOwnDailyRate),
            rentToOwnMonths: rtoTenureMonths(vehicle.rentToOwnMonths),
          };
        }),
        cursor ? 1 : page,
        pageLimit
      );
      const response = pageRequested
        ? withNextCursor(
            payload,
            payload.data[payload.data.length - 1] as
              | { createdAt?: unknown; _id?: unknown }
              | undefined
          )
        : { ...payload, pagination: undefined };

      return NextResponse.json({
        ...response,
        data: response.data,
        ...(cursor ? {} : { summary: summaryRows[0] || {
          total: 0,
          available: 0,
          inRide: 0,
          maintenance: 0,
          lowBattery: 0,
          rto: 0,
          online: 0,
          locked: 0,
        } }),
      });
    }

    /*
     * Public / rider-facing vehicle
     * availability. Optional city/hub keeps Book EV fast
     * when many cities are live. No params = same as before.
     */
    const { searchParams } = new URL(req.url);
    const cityFilter = clean(searchParams.get("city"));
    const hubFilter = clean(searchParams.get("hub") || searchParams.get("currentHub")).toUpperCase();
    const availability: Record<string, unknown>[] = [
      {
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } },
        ],
      },
      {
        $or: [
          { isActive: true },
          { isActive: { $exists: false } },
        ],
      },
      {
        $or: [
          { vehicleStatus: "Available" },
          { vehicleStatus: "available" },
        ],
      },
    ];
    if (hubFilter) {
      availability.push({ currentHub: hubFilter });
    } else if (cityFilter) {
      const hubCodes = (
        await Hub.distinct("hubCode", {
          status: "Active",
          city: new RegExp(
            `^${cityFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
          $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        })
      )
        .map((code) => String(code || "").trim().toUpperCase())
        .filter(Boolean);
      availability.push({
        currentHub: { $in: hubCodes.length ? hubCodes : ["__none__"] },
      });
    }

    const vehicles =
      await Vehicle.find({
        $and: availability,
      })
        .select(
          [
            "vehicleId",
            "registrationNumber",
            "vehicleType",
            "vehicleModel",
            "batteryType",
            "registrationType",
            "hourlyRate",
            "dailyRate",
            "weeklyRate",
            "monthlyRate",
            "rentToOwnDailyRate",
            "rentToOwnMonths",
            "securityDeposit",
            "batteryPercentage",
            "currentHub",
            "vehicleStatus",
          ].join(" ")
        )
        .sort({
          createdAt: -1,
        })
        .limit(500)
        .lean();

    return NextResponse.json({
      success: true,
      data: vehicles.map((vehicle) => {
        const telemetryFresh = hasRecentVehiclePing(vehicle.lastPingTime);
        return {
          ...vehicle,
          telemetryFresh,
          gpsStatus: effectiveGpsStatus(vehicle.gpsStatus, vehicle.lastPingTime),
          batteryPercentage: telemetryFresh ? vehicle.batteryPercentage : null,
          currentLatitude: telemetryFresh ? vehicle.currentLatitude : null,
          currentLongitude: telemetryFresh ? vehicle.currentLongitude : null,
          hourlyRate: catalogRate("Hourly", vehicle.hourlyRate),
          dailyRate: catalogRate("Daily", vehicle.dailyRate),
          weeklyRate: catalogRate("Weekly", vehicle.weeklyRate),
          monthlyRate: catalogRate("Monthly", vehicle.monthlyRate),
          rentToOwnDailyRate: rtoDailyRate(vehicle.rentToOwnDailyRate),
          rentToOwnMonths: rtoTenureMonths(vehicle.rentToOwnMonths),
        };
      }),
    });
  } catch (error) {
    console.error(
      "VEHICLE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch vehicles.",
      },
      { status: 500 }
    );
  }
}
