import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

const vehicleStatuses = [
  "Available",
  "Booked",
  "In Ride",
  "Maintenance",
  "Low Battery",
];

const lockStatuses = ["Locked", "Unlocked"];
const gpsStatuses = ["ONLINE", "OFFLINE"];
const batteryTypes = ["Chargeable", "Swappable"];
const registrationTypes = ["RTO", "Non-RTO"];

const allowedUpdateFields = [
  "registrationType",
  "vehicleType",
  "vehicleModel",
  "batteryType",
  "dailyRate",
  "weeklyRate",
  "monthlyRate",
  "securityDeposit",
  "odometer",
  "lastServiceDate",
  "fitnessExpiry",
  "remarks",
  "batteryPercentage",
  "gpsStatus",
  "lockStatus",
  "currentHub",
  "vehicleStatus",
  "assignedRider",
  "insuranceExpiry",
  "pollutionExpiry",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidNonNegativeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0;
}

function isValidPercentage(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 100;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const field of allowedUpdateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          errors: ["No valid vehicle update fields received."],
        },
        { status: 400 }
      );
    }

    if (
      updateData.vehicleStatus &&
      !vehicleStatuses.includes(clean(updateData.vehicleStatus))
    ) {
      errors.push("Invalid vehicle status.");
    }

    if (
      updateData.lockStatus &&
      !lockStatuses.includes(clean(updateData.lockStatus))
    ) {
      errors.push("Invalid lock status.");
    }

    if (
      updateData.gpsStatus &&
      !gpsStatuses.includes(clean(updateData.gpsStatus))
    ) {
      errors.push("Invalid GPS status.");
    }

    if (
      updateData.batteryType &&
      !batteryTypes.includes(clean(updateData.batteryType))
    ) {
      errors.push("Invalid battery type.");
    }

    if (
      updateData.registrationType &&
      !registrationTypes.includes(clean(updateData.registrationType))
    ) {
      errors.push("Invalid registration type.");
    }

    if (
      updateData.batteryPercentage !== undefined &&
      !isValidPercentage(updateData.batteryPercentage)
    ) {
      errors.push("Battery percentage must be between 0 and 100.");
    }

    const amountFields = [
      "dailyRate",
      "weeklyRate",
      "monthlyRate",
      "securityDeposit",
      "odometer",
    ];

    for (const field of amountFields) {
      if (
        updateData[field] !== undefined &&
        !isValidNonNegativeNumber(updateData[field])
      ) {
        errors.push(`${field} must be a valid non-negative number.`);
      }
    }

    if (updateData.currentHub !== undefined) {
      const currentHub = clean(updateData.currentHub);

      if (currentHub.length > 0 && currentHub.length < 3) {
        errors.push("Current hub is invalid.");
      }

      updateData.currentHub = currentHub;
    }

    if (updateData.assignedRider !== undefined) {
      updateData.assignedRider = clean(updateData.assignedRider).slice(0, 80);
    }

    if (updateData.remarks !== undefined) {
      updateData.remarks = clean(updateData.remarks).slice(0, 300);
    }

    if (updateData.vehicleStatus !== undefined) {
      updateData.vehicleStatus = clean(updateData.vehicleStatus);
    }

    if (updateData.lockStatus !== undefined) {
      updateData.lockStatus = clean(updateData.lockStatus);
    }

    if (updateData.gpsStatus !== undefined) {
      updateData.gpsStatus = clean(updateData.gpsStatus);
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

    const vehicle = await Vehicle.findById(id);

if (!vehicle) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Vehicle not found."],
    },
    { status: 404 }
  );
}

Object.assign(vehicle, updateData);
if (vehicle.batteryPercentage < 20) {
  vehicle.vehicleStatus = "Low Battery";
}

if (
  vehicle.vehicleStatus === "Low Battery" &&
  vehicle.batteryPercentage >= 20
) {
  vehicle.vehicleStatus = "Available";
}

await vehicle.save();

     return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const { id } = await params;

    const vehicle = await Vehicle.findById(id);

if (!vehicle) {
  return NextResponse.json(
    {
      success: false,
      error: "Vehicle not found.",
    },
    { status: 404 }
  );
}

if (
  vehicle.vehicleStatus === "Booked" ||
  vehicle.vehicleStatus === "In Ride" ||
  vehicle.vehicleStatus === "Maintenance"
) {
  return NextResponse.json(
    {
      success: false,
      error: "Cannot delete a vehicle that is booked or currently in ride.",
    },
    { status: 400 }
  );
}

    await Vehicle.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}