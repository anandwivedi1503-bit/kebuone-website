import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Battery from "@/models/Battery";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.batteries);
    if (gate.error) return gate.error;
    await connectDB();

    const notDeleted = {
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    };

    const [batteries, vehicles] = await Promise.all([
      Battery.find(notDeleted).sort({ createdAt: -1 }).lean(),
      Vehicle.find(notDeleted)
        .select("vehicleId batteryPercentage vehicleStatus currentHub currentBatteryId")
        .lean(),
    ]);

    const vehicleMap = new Map(vehicles.map((row) => [String(row.vehicleId), row]));
    const vehicleByPack = new Map(
      vehicles
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

    const knownPacks = new Set(
      data.map((row) => String(row.batteryId || "").toUpperCase())
    );
    for (const vehicle of vehicles) {
      const packId = String(vehicle.currentBatteryId || "").trim().toUpperCase();
      if (!packId || knownPacks.has(packId)) continue;
      knownPacks.add(packId);
      data.push({
        _id: `vehicle-pack-${vehicle.vehicleId}`,
        batteryId: packId,
        hubName: vehicle.currentHub || "",
        vehicleId: vehicle.vehicleId,
        chargePercentage: Number(vehicle.batteryPercentage || 0),
        batteryHealth: undefined,
        cycleCount: 0,
        status: "IN-VEHICLE",
        fromVehicle: true,
        vehicleBatteryPercentage: Number(vehicle.batteryPercentage || 0),
        vehicleStatus: vehicle.vehicleStatus || "",
        vehicleHub: vehicle.currentHub || "",
        vehiclePackId: packId,
      });
    }

    return NextResponse.json({
      success: true,
      data,
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