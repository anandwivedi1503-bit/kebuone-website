import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Battery from "@/models/Battery";
import Vehicle from "@/models/Vehicle";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import {
  applyCreatedCursor,
  listResponse,
  listResponseFromPage,
  parseListQuery,
  withNextCursor,
} from "@/lib/listQuery";

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.batteries);
    if (gate.error) return gate.error;
    await connectDB();
    const { page, limit, skip, cursor } = parseListQuery(req);
    const vehiclePackCursor = new URL(req.url).searchParams.get("vehicleCursor") || "";

    const notDeleted = {
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    };
    const hubs = await resolveHubScope(gate.session);
    const vehicleQuery = applyHubScope({ ...notDeleted }, hubs, ["currentHub"]);
    const scopedVehicleIds = hubs
      ? (await Vehicle.distinct("vehicleId", vehicleQuery)).map((id) =>
          String(id || "").trim()
        )
      : null;
    const batteryQuery = scopedVehicleIds
      ? {
          $and: [
            notDeleted,
            {
              $or: [
                { hubId: { $in: hubs || [] } },
                {
                  vehicleId: {
                    $in: scopedVehicleIds.length ? scopedVehicleIds : ["__none__"],
                  },
                },
              ],
            },
          ],
        }
      : notDeleted;
    const summaryFilter = { ...batteryQuery };
    applyCreatedCursor(batteryQuery, cursor);
    const vehiclePackFilter = applyHubScope(
      {
        $and: [notDeleted, { currentBatteryId: { $type: "string", $nin: ["", null] } }],
      },
      hubs,
      ["currentHub"]
    );
    applyCreatedCursor(vehiclePackFilter, vehiclePackCursor);

    const [batteryRows, vehiclePackRows, summaryRows] = await Promise.all([
      Battery.find(batteryQuery)
        .sort({ createdAt: -1, _id: -1 })
        .skip(cursor ? 0 : skip)
        .limit(limit + 1)
        .lean(),
      Vehicle.find(vehiclePackFilter)
        .select("vehicleId batteryPercentage vehicleStatus currentHub currentBatteryId createdAt _id")
        .sort({ createdAt: -1, _id: -1 })
        .skip(vehiclePackCursor ? 0 : skip)
        .limit(limit + 1)
        .lean(),
      cursor || vehiclePackCursor ? Promise.resolve([]) : Battery.aggregate([
        { $match: summaryFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            ready: { $sum: { $cond: [{ $eq: ["$status", "READY"] }, 1, 0] } },
            charging: { $sum: { $cond: [{ $eq: ["$status", "CHARGING"] }, 1, 0] } },
            inVehicle: { $sum: { $cond: [{ $eq: ["$status", "IN-VEHICLE"] }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ["$status", "MAINTENANCE"] }, 1, 0] } },
            averageCharge: { $avg: { $ifNull: ["$chargePercentage", 0] } },
            averageHealth: { $avg: "$batteryHealth" },
            replacementNeeded: {
              $sum: {
                $cond: [
                  { $and: [{ $isNumber: "$batteryHealth" }, { $lt: ["$batteryHealth", 50] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);
    const hasMoreBatteries = batteryRows.length > limit;
    const batteries = hasMoreBatteries ? batteryRows.slice(0, limit) : batteryRows;

    const batteryIds = batteries
      .map((battery) => String(battery.batteryId || "").trim().toUpperCase())
      .filter(Boolean);
    const vehicleIds = batteries
      .map((battery) => String(battery.vehicleId || "").trim())
      .filter(Boolean);
    const relatedVehicles = batteryIds.length || vehicleIds.length
      ? await Vehicle.find(
          applyHubScope(
            {
              $or: [
                { currentBatteryId: { $in: batteryIds.length ? batteryIds : ["__none__"] } },
                { vehicleId: { $in: vehicleIds.length ? vehicleIds : ["__none__"] } },
              ],
            },
            hubs,
            ["currentHub"]
          )
        )
          .select("vehicleId batteryPercentage vehicleStatus currentHub currentBatteryId")
          .lean()
      : [];
    const vehiclePacks = vehiclePackRows.length > limit
      ? vehiclePackRows.slice(0, limit)
      : vehiclePackRows;
    const fittedPackIds = Array.from(
      new Set(vehiclePacks.map((vehicle) => String(vehicle.currentBatteryId || "").trim().toUpperCase()).filter(Boolean))
    );
    const registeredPackRows = fittedPackIds.length
      ? await Battery.find({
          batteryId: { $in: fittedPackIds },
          $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        })
          .select("batteryId")
          .lean()
      : [];
    const registeredPackIds = new Set(
      registeredPackRows.map((battery) => String(battery.batteryId || "").trim().toUpperCase())
    );
    const untrackedVehiclePacks = vehiclePacks
      .filter((vehicle) => !registeredPackIds.has(String(vehicle.currentBatteryId || "").trim().toUpperCase()))
      .map((vehicle) => ({
        _id: `vehicle-pack-${vehicle.vehicleId}`,
        batteryId: String(vehicle.currentBatteryId || "").trim().toUpperCase(),
        hubName: vehicle.currentHub || "",
        vehicleId: vehicle.vehicleId,
        chargePercentage: Number(vehicle.batteryPercentage || 0),
        batteryHealth: undefined,
        cycleCount: 0,
        status: "IN-VEHICLE",
        fromVehicle: true,
        createdAt: vehicle.createdAt,
        vehicleBatteryPercentage: Number(vehicle.batteryPercentage || 0),
        vehicleStatus: vehicle.vehicleStatus || "",
        vehicleHub: vehicle.currentHub || "",
        vehiclePackId: vehicle.currentBatteryId || "",
      }));
    const vehicleMap = new Map(relatedVehicles.map((row) => [String(row.vehicleId), row]));
    const vehicleByPack = new Map(
      relatedVehicles
        .filter((row) => String(row.currentBatteryId || "").trim())
        .map((row) => [String(row.currentBatteryId).toUpperCase(), row])
    );

    const data: Array<Record<string, unknown>> = batteries.map((battery) => {
      const vehicle =
        vehicleMap.get(String(battery.vehicleId || "")) ||
        vehicleByPack.get(String(battery.batteryId || "").toUpperCase());
      const onScooter =
        String(battery.status || "") === "IN-VEHICLE" || Boolean(battery.vehicleId);
      const charge = onScooter && vehicle
        ? Number(vehicle.batteryPercentage || 0)
        : Number(battery.chargePercentage || 0);
      return {
        ...battery,
        chargePercentage: charge,
        vehicleId: battery.vehicleId || vehicle?.vehicleId || "",
        vehicleBatteryPercentage: vehicle ? Number(vehicle.batteryPercentage || 0) : null,
        vehicleStatus: vehicle?.vehicleStatus || "",
        vehicleHub: vehicle?.currentHub || "",
        vehiclePackId: vehicle?.currentBatteryId || "",
      };
    });

    const payload = listResponse(
      data,
      (cursor ? 0 : skip) + batteries.length + (hasMoreBatteries ? 1 : 0),
      cursor ? 1 : page,
      limit
    );
    const vehiclePackPayload = listResponseFromPage(
      vehiclePackRows,
      vehiclePackCursor ? 1 : page,
      limit
    );
    return NextResponse.json({
      ...withNextCursor(
        payload,
        batteries[batteries.length - 1] as
          | { createdAt?: unknown; _id?: unknown }
          | undefined
      ),
      vehiclePacks: untrackedVehiclePacks,
      vehiclePagination: withNextCursor(
        vehiclePackPayload,
        vehiclePackPayload.data[vehiclePackPayload.data.length - 1] as
          | { createdAt?: unknown; _id?: unknown }
          | undefined
      ).pagination,
      ...(cursor || vehiclePackCursor ? {} : { summary: summaryRows[0] || {
        total: 0,
        ready: 0,
        charging: 0,
        inVehicle: 0,
        maintenance: 0,
        averageCharge: 0,
        averageHealth: 0,
        replacementNeeded: 0,
      } }),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
    });
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.batteries);
    if (gate.error) return gate.error;
    await connectDB();

    const body = await req.json();

    const existing = await Battery.findOne({
  batteryId: body.batteryId,
});

if (existing) {
  return NextResponse.json(
    {
      success: false,
      message: "Battery ID already exists.",
    },
    { status: 409 }
  );
}

    const battery = await Battery.create(body);

    return NextResponse.json({
      success: true,
      data: battery,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
    });
  }
}
