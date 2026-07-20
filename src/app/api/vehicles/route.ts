import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await req.json();

    const vehicleId = String(body.vehicleId || "").trim();
    const registrationNumber = String(body.registrationNumber || "")
      .trim()
      .toUpperCase();
    const chassisNumber = String(body.chassisNumber || "")
      .trim()
      .toUpperCase();
    const vehicleModel = String(body.vehicleModel || "").trim();
    const currentHub = String(body.currentHub || "").trim();

    const errors: string[] = [];

    if (vehicleId.length < 3) {
      errors.push("Vehicle ID is required.");
    }

    if (registrationNumber.length < 5) {
      errors.push("Valid registration number is required.");
    }

    if (chassisNumber.length < 5) {
      errors.push("Valid chassis number is required.");
    }

    if (vehicleModel.length < 2) {
      errors.push("Vehicle model is required.");
    }
    if (currentHub.length < 2) {
  errors.push("Current Hub is required.");
}

    if (
      body.batteryPercentage !== undefined &&
      (Number(body.batteryPercentage) < 0 ||
        Number(body.batteryPercentage) > 100)
    ) {
      errors.push("Battery percentage must be between 0 and 100.");
    }

    ["dailyRate", "weeklyRate", "monthlyRate", "securityDeposit"].forEach(
      (field) => {
        if (
          body[field] !== undefined &&
          Number(body[field]) < 0
        ) {
          errors.push(`${field} cannot be negative.`);
        }
      }
    );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    const existingVehicle = await Vehicle.findOne({
      $or: [
        { vehicleId },
        { registrationNumber },
        { chassisNumber },
      ],
    });

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

    const vehicle = await Vehicle.create({
  ...body,

  vehicleId,
  registrationNumber,
  chassisNumber,
  vehicleModel,
  currentHub,

  vehicleStatus: "Available",
  assignedRider: "",
  currentBookingId: "",
  currentRiderId: "",
  batteryPercentage: Number(body.batteryPercentage || 100),
  gpsStatus: body.gpsStatus || "ONLINE",
  lockStatus: "Locked",
  isActive: true,
});

    return NextResponse.json({
      success: true,
      data: vehicle,
    });

  } catch (error) {
    console.error("VEHICLE CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create vehicle.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    if (await isAdminAuthenticated()) {
      const vehicles = await Vehicle.find().sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        data: vehicles,
      });
    }

    const vehicles = await Vehicle.find({ vehicleStatus: "Available" })
      .select(
        "vehicleId registrationNumber vehicleType vehicleModel batteryType registrationType dailyRate weeklyRate monthlyRate securityDeposit batteryPercentage currentHub vehicleStatus"
      )
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vehicles.",
      },
      { status: 500 }
    );
  }
}