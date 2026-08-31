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

import Hub, {
  IHub,
} from "@/models/Hub";
import Battery from "@/models/Battery";
import Vehicle from "@/models/Vehicle";

const hubTypes = [
  "Main Hub",
  "Mini Hub",
  "Charging Hub",
  "Battery Swap Hub",
];

const hubStatuses = [
  "Active",
  "Inactive",
  "Maintenance",
  "Closed",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function upper(value: unknown) {
  return clean(value).toUpperCase();
}

function numberValue(
  value: unknown,
  defaultValue = 0
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : NaN;
}

export async function POST(
  req: Request
) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.hubsWrite);
    if (gate.error) return gate.error;

    await connectDB();

    const body =
      await req.json();

    const hubName =
      clean(body.hubName);

    const hubCode =
      upper(body.hubCode);

    const hubLocation =
      clean(body.hubLocation);

    const city =
      clean(body.city);

    const hubType =
      clean(
        body.hubType ||
          "Main Hub"
      );

    const hubManager =
      clean(body.hubManager);

    const managerPhone =
      clean(body.managerPhone);

    const latitude =
      numberValue(
        body.latitude,
        NaN
      );

    const longitude =
      numberValue(
        body.longitude,
        NaN
      );

    const geofenceRadius =
      numberValue(
        body.geofenceRadius,
        20
      );

    const capacity =
      numberValue(
        body.capacity,
        0
      );

    const readyBatteries =
      numberValue(
        body.readyBatteries,
        0
      );

    const status =
      clean(
        body.status ||
          "Active"
      );

    const errors: string[] = [];

    if (hubName.length < 2) {
      errors.push(
        "Hub name is required."
      );
    }

    if (hubCode.length < 2) {
      errors.push(
        "Hub code is required."
      );
    }

    if (hubLocation.length < 2) {
      errors.push(
        "Hub location is required."
      );
    }

    if (city.length < 2) {
      errors.push(
        "City is required."
      );
    }

    if (
      !hubTypes.includes(
        hubType
      )
    ) {
      errors.push(
        "Invalid hub type."
      );
    }

    if (
      !hubStatuses.includes(
        status
      )
    ) {
      errors.push(
        "Invalid hub status."
      );
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      errors.push(
        "Latitude must be between -90 and 90."
      );
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      errors.push(
        "Longitude must be between -180 and 180."
      );
    }

    if (
      !Number.isFinite(
        geofenceRadius
      ) ||
      geofenceRadius < 1
    ) {
      errors.push(
        "Geofence radius must be greater than 0."
      );
    }

    if (
      !Number.isFinite(capacity) ||
      capacity < 0
    ) {
      errors.push(
        "Capacity cannot be negative."
      );
    }

    if (
      !Number.isFinite(
        readyBatteries
      ) ||
      readyBatteries < 0
    ) {
      errors.push(
        "Ready batteries cannot be negative."
      );
    }

    if (
      managerPhone &&
      !/^[6-9]\d{9}$/.test(
        managerPhone
      )
    ) {
      errors.push(
        "Manager phone number is invalid."
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

    const existingHub =
      await Hub.findOne({
        isDeleted: false,
        $or: [
          { hubName },
          { hubCode },
        ],
      }).lean();

    if (existingHub) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Hub name or hub code already exists.",
          ],
        },
        { status: 409 }
      );
    }

    /*
     * availableBikes is intentionally NOT
     * accepted from the frontend.
     */
    const hub =
      await Hub.create({
        hubName,

        hubCode,

        hubLocation,

        hubType,

        city,

        hubManager,

        managerPhone,

        latitude,

        longitude,

        geofenceRadius,

        capacity,

        readyBatteries,

        chargingBatteries:
          0,

        damagedBatteries:
          0,

        vehiclesInRide:
          0,

        vehiclesUnderMaintenance:
          0,

        availableBikes:
          0,

        status,

        updatedBy:
          "Admin",

        isDeleted:
          false,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Hub created successfully.",
        data: hub,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "HUB CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create hub.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const isAdmin = sessionHasAnyDashboard(
      await getAdminSession(),
      ...API_DASHBOARDS.hubsRead
    );

    /*
 * Never return deleted hubs.
 */
const { searchParams } = new URL(req.url);
const cityFilter = clean(searchParams.get("city"));

const hubQuery: Record<string, unknown> = {
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } },
  ],
};

if (!isAdmin) {
  hubQuery.status = "Active";
}

if (cityFilter) {
  hubQuery.city = new RegExp(
    `^${cityFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );
}

const hubs = await Hub.find(hubQuery)
  .sort({
    createdAt: -1,
  })
  .lean<IHub[]>();

    /*
     * Calculate actual vehicle inventory
     * from Vehicle collection.
     *
     * This removes the need for the admin
     * to manually maintain availableBikes.
     */
    const vehicleCounts =
      await Vehicle.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
          },
        },

        {
          $group: {
            _id: "$currentHub",

            totalVehicles: {
              $sum: 1,
            },

            availableBikes: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$vehicleStatus",
                      "Available",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            vehiclesInRide: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$vehicleStatus",
                      "In Ride",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            vehiclesUnderMaintenance:
              {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$vehicleStatus",
                        "Maintenance",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
          },
        },
      ]);

    const countsMap =
      new Map<
        string,
        {
          totalVehicles: number;
          availableBikes: number;
          vehiclesInRide: number;
          vehiclesUnderMaintenance: number;
        }
      >();

    for (
      const item of vehicleCounts
    ) {
      countsMap.set(
        String(item._id)
          .trim()
          .toUpperCase(),
        {
          totalVehicles:
            Number(
              item.totalVehicles
            ) || 0,

          availableBikes:
            Number(
              item.availableBikes
            ) || 0,

          vehiclesInRide:
            Number(
              item.vehiclesInRide
            ) || 0,

          vehiclesUnderMaintenance:
            Number(
              item.vehiclesUnderMaintenance
            ) || 0,
        }
      );
    }

    const batteries = await Battery.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .select("hubId hubName status")
      .lean();

    const data =
  hubs.map((hub: IHub) => {
        /*
         * New records use hubCode.
         *
         * hubName fallback supports older
         * vehicles created before this change.
         */
        const codeKey =
          String(
            hub.hubCode
          )
            .trim()
            .toUpperCase();

        const nameKey =
          String(
            hub.hubName
          )
            .trim()
            .toUpperCase();

        const counts =
          countsMap.get(
            codeKey
          ) ||
          countsMap.get(
            nameKey
          ) || {
            totalVehicles: 0,
            availableBikes: 0,
            vehiclesInRide: 0,
            vehiclesUnderMaintenance: 0,
          };

        const packCounts = batteries.reduce(
          (acc, pack) => {
            const hubId = String(pack.hubId || "").trim().toUpperCase();
            const hubName = String(pack.hubName || "").trim().toUpperCase();
            if (hubId !== codeKey && hubName !== nameKey && hubName !== codeKey && hubId !== nameKey) {
              return acc;
            }
            if (pack.status === "READY") acc.ready += 1;
            if (pack.status === "CHARGING") acc.charging += 1;
            if (pack.status === "MAINTENANCE" || pack.status === "DAMAGED") acc.damaged += 1;
            return acc;
          },
          { ready: 0, charging: 0, damaged: 0 }
        );

        return {
          ...hub,

          availableBikes:
            counts.availableBikes,

          vehiclesInRide:
            counts.vehiclesInRide,

          vehiclesUnderMaintenance:
            counts.vehiclesUnderMaintenance,

          totalVehicles:
            counts.totalVehicles,

          occupiedVehicles:
            Math.max(0, counts.totalVehicles - counts.availableBikes),

          readyBatteries: packCounts.ready,
          chargingBatteries: packCounts.charging,
          damagedBatteries: packCounts.damaged,
        };
      });

    if (isAdmin) {
      return NextResponse.json({
        success: true,
        data,
      });
    }

    /*
     * Public response.
     */
    const publicData =
      data.map((hub) => ({
        _id: hub._id,
        hubName:
          hub.hubName,
        hubCode:
          hub.hubCode,
        hubLocation:
          hub.hubLocation,
        city: hub.city,
        latitude:
          hub.latitude,
        longitude:
          hub.longitude,
        availableBikes:
          hub.availableBikes,
        openingTime:
          hub.openingTime,
        closingTime:
          hub.closingTime,
        status:
          hub.status,
      }));

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error(
      "HUB GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch hubs.",
      },
      { status: 500 }
    );
  }
}