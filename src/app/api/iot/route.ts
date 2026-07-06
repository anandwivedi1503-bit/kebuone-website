import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import IoT from "@/models/IoT";

const lockStatuses = ["Locked", "Unlocked"];
const gpsStatuses = ["ONLINE", "OFFLINE"];
const vehicleStatuses = ["Available", "Booked", "In Ride", "Maintenance", "Low Battery"];

function clean(value: unknown) {
  return String(value || "").trim();
}

function numberInRange(value: unknown, min: number, max: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= min && numberValue <= max;
}

function isDeviceAuthenticated(req: Request) {
  const secret = process.env.IOT_DEVICE_SECRET;
  const receivedSecret = req.headers.get("x-iot-secret");

  return Boolean(secret && receivedSecret && secret === receivedSecret);
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const iotData = await IoT.find().sort({ createdAt: -1 }).limit(500);

    return NextResponse.json({
      success: true,
      data: iotData,
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
    const vehicleId = clean(body.vehicleId).slice(0, 80);
    const lockStatus = clean(body.lockStatus);
    const gpsStatus = clean(body.gpsStatus).toUpperCase();
    const vehicleStatus = clean(body.vehicleStatus);
    const alertType = clean(body.alertType).slice(0, 80);

    const errors: string[] = [];

    if (!vehicleId) errors.push("Vehicle ID is required.");
    if (!numberInRange(body.batteryPercentage, 0, 100)) errors.push("Battery percentage must be 0 to 100.");
    if (!numberInRange(body.currentLat, -90, 90)) errors.push("Latitude is invalid.");
    if (!numberInRange(body.currentLng, -180, 180)) errors.push("Longitude is invalid.");
    if (!lockStatuses.includes(lockStatus)) errors.push("Invalid lock status.");
    if (!gpsStatuses.includes(gpsStatus)) errors.push("Invalid GPS status.");
    if (!vehicleStatuses.includes(vehicleStatus)) errors.push("Invalid vehicle status.");

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const iot = await IoT.create({
      vehicleId,
      batteryPercentage: Number(body.batteryPercentage),
      currentLat: Number(body.currentLat),
      currentLng: Number(body.currentLng),
      lockStatus,
      gpsStatus,
      vehicleStatus,
      alertType,
    });

    return NextResponse.json({
      success: true,
      data: iot,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save IoT data." },
      { status: 500 }
    );
  }
}