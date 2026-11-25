import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import iot from "@/models/IoT";
import Vehicle from "@/models/Vehicle";
import Booking from "@/models/Booking";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import { providedSecretMatches } from "@/lib/timingSafe";
import { effectiveGpsStatus, hasRecentVehiclePing } from "@/lib/vehicleTelemetry";
import {
  applyCreatedCursor,
  listResponseFromPage,
  parseListQuery,
  withNextCursor,
} from "@/lib/listQuery";

const lockStatuses = ["Locked", "Unlocked"];
const gpsStatuses = ["ONLINE", "OFFLINE"];
const vehicleStatuses = [
  "Available",
  "Booked",
  "Ready For Pickup",
  "In Ride",
  "Maintenance",
  "Low Battery",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function numberInRange(value: unknown, min: number, max: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= min && numberValue <= max;
}

function isDeviceAuthenticated(req: Request) {
  return providedSecretMatches(
    process.env.IOT_DEVICE_SECRET || "",
    req.headers.get("x-iot-secret") || ""
  );
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.iot);
    if (gate.error) return gate.error;

    await connectDB();

    const vehicleFilter = applyHubScope(
      {
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      },
      await resolveHubScope(gate.session),
      ["currentHub"]
    );
    const { page, limit, skip, cursor } = parseListQuery(req);
    const summaryFilter = { ...vehicleFilter };
    applyCreatedCursor(vehicleFilter, cursor);
    const freshSince = new Date(Date.now() - 15 * 60 * 1000);
    const [vehicles, summaryRows] = await Promise.all([
      Vehicle.find(vehicleFilter)
        .select(
          "vehicleId batteryPercentage currentLatitude currentLongitude lockStatus gpsStatus vehicleStatus lastPingTime createdAt currentHub currentBatteryId currentBookingId"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(cursor ? 0 : skip)
        .limit(limit + 1)
        .lean(),
      cursor ? Promise.resolve([]) : Vehicle.aggregate([
        { $match: summaryFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            online: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$lastPingTime", freshSince] },
                      { $eq: [{ $toUpper: { $ifNull: ["$gpsStatus", ""] } }, "ONLINE"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            locked: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$lastPingTime", freshSince] },
                      { $eq: [{ $toUpper: { $ifNull: ["$lockStatus", ""] } }, "LOCKED"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            unlocked: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$lastPingTime", freshSince] },
                      { $eq: [{ $toUpper: { $ifNull: ["$lockStatus", ""] } }, "UNLOCKED"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const vehicleIds = vehicles.map((vehicle) => vehicle.vehicleId);
    const latestAlerts = vehicleIds.length
      ? await iot
          .find({ vehicleId: { $in: vehicleIds } })
          .select("vehicleId alertType updatedAt")
          .sort({ updatedAt: -1 })
          .limit(500)
          .lean()
      : [];

    const alertByVehicle = new Map<string, string>();
    for (const item of latestAlerts) {
      const id = String(item.vehicleId || "");
      const alertIsFresh = hasRecentVehiclePing(item.updatedAt);
      if (id && alertIsFresh && !alertByVehicle.has(id)) {
        alertByVehicle.set(id, item.alertType || "");
      }
    }

    const iotData = vehicles.map((vehicle) => {
      const telemetryFresh = hasRecentVehiclePing(vehicle.lastPingTime);
      return {
        _id: vehicle._id,
        vehicleId: vehicle.vehicleId,
        batteryPercentage: telemetryFresh ? vehicle.batteryPercentage : null,
        currentLat: telemetryFresh ? vehicle.currentLatitude : null,
        currentLng: telemetryFresh ? vehicle.currentLongitude : null,
        lockStatus: telemetryFresh ? vehicle.lockStatus : null,
        gpsStatus: effectiveGpsStatus(vehicle.gpsStatus, vehicle.lastPingTime),
        telemetryFresh,
        vehicleStatus: vehicle.vehicleStatus,
        currentHub: vehicle.currentHub || "",
        currentBatteryId: vehicle.currentBatteryId || "",
        currentBookingId: vehicle.currentBookingId || "",
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.lastPingTime || null,
        alertType: telemetryFresh ? alertByVehicle.get(vehicle.vehicleId) || "" : "",
      };
    });

    const payload = listResponseFromPage(iotData, cursor ? 1 : page, limit);
    return NextResponse.json({
      ...withNextCursor(
        payload,
        payload.data[payload.data.length - 1] as
          | { createdAt?: unknown; _id?: unknown }
          | undefined
      ),
      ...(cursor ? {} : { summary: summaryRows[0] || { total: 0, online: 0, locked: 0, unlocked: 0 } }),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch IoT data." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isDeviceAuthenticated(req)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized IoT request." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const vehicleId = clean(body.vehicleId).toUpperCase().slice(0, 80);
    const lockStatus = clean(body.lockStatus);
    const gpsStatus = clean(body.gpsStatus).toUpperCase();
    const vehicleStatus = clean(body.vehicleStatus);
    const alertType = clean(body.alertType).slice(0, 80);
    const deviceTimestamp = body.deviceTimestamp
      ? new Date(body.deviceTimestamp)
      : null;

    const errors: string[] = [];

    if (!vehicleId) errors.push("Vehicle ID is required.");
    if (!numberInRange(body.batteryPercentage, 0, 100)) errors.push("Battery percentage must be 0 to 100.");
    if (!numberInRange(body.currentLat, -90, 90)) errors.push("Latitude is invalid.");
    if (!numberInRange(body.currentLng, -180, 180)) errors.push("Longitude is invalid.");
    if (!lockStatuses.includes(lockStatus)) errors.push("Invalid lock status.");
    if (!gpsStatuses.includes(gpsStatus)) errors.push("Invalid GPS status.");
    if (!vehicleStatuses.includes(vehicleStatus)) errors.push("Invalid vehicle status.");
    if (deviceTimestamp && !Number.isFinite(deviceTimestamp.getTime())) {
      errors.push("Device timestamp is invalid.");
    }

    const now = new Date();
    if (deviceTimestamp && deviceTimestamp.getTime() > now.getTime() + 2 * 60 * 1000) {
      errors.push("Device timestamp is too far in the future.");
    }
    if (deviceTimestamp && now.getTime() - deviceTimestamp.getTime() > 15 * 60 * 1000) {
      return NextResponse.json(
        { success: true, ignored: true, message: "Stale device reading ignored." },
        { status: 202 }
      );
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const vehicle = await Vehicle.findOne({
      vehicleId,
      isDeleted: { $ne: true },
    });
    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "No active scooter matches this vehicle ID. Register and link the scooter before sending telemetry.",
        },
        { status: 404 }
      );
    }
    const priorReading = (await iot
      .findOne({ vehicleId })
      .select("deviceTimestamp")
      .lean()) as unknown as { deviceTimestamp?: Date | string } | null;
    if (
      deviceTimestamp &&
      priorReading?.deviceTimestamp &&
      new Date(priorReading.deviceTimestamp).getTime() > deviceTimestamp.getTime()
    ) {
      return NextResponse.json(
        { success: true, ignored: true, message: "Out-of-order device reading ignored." },
        { status: 202 }
      );
    }
    const nextStatus =
      vehicle?.currentBookingId &&
      (vehicleStatus === "Available" || vehicleStatus === "Low Battery")
        ? String(vehicle.vehicleStatus || vehicleStatus)
        : vehicleStatus;

    await Vehicle.findOneAndUpdate(
  { vehicleId },
  {
    batteryPercentage: Number(body.batteryPercentage),

    gpsStatus,

    lockStatus:
      vehicle?.currentBookingId && lockStatus === "Unlocked" && vehicleStatus === "Available"
        ? vehicle.lockStatus
        : lockStatus,

    vehicleStatus: nextStatus,

    currentLatitude: Number(body.currentLat),

    currentLongitude: Number(body.currentLng),

    lastPingTime: new Date(),
  }
);

    if (vehicle?.currentBookingId) {
      await Booking.updateOne(
        { bookingId: vehicle.currentBookingId },
        {
          $set: {
            lastLatitude: Number(body.currentLat),
            lastLongitude: Number(body.currentLng),
            lastGpsAt: new Date(),
            batteryPercentage: Number(body.batteryPercentage),
          },
        }
      );
    }

const newIot = await iot.findOneAndUpdate(
  { vehicleId },
  {
    $set: {
      batteryPercentage: Number(body.batteryPercentage),
      currentLat: Number(body.currentLat),
      currentLng: Number(body.currentLng),
      lockStatus,
      gpsStatus,
      vehicleStatus: nextStatus,
      alertType,
      ...(deviceTimestamp ? { deviceTimestamp } : {}),
    },
  },
  {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }
);

return NextResponse.json({
  success: true,
  data: newIot,
});
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save IoT data." },
      { status: 500 }
    );
  }
}
