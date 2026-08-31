import { denyStaffDeletes, isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Battery from "@/models/Battery";
import Vehicle from "@/models/Vehicle";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.batteries);
    if (gate.error) return gate.error;
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    if (
  body.chargePercentage !== undefined &&
  (Number(body.chargePercentage) < 0 ||
    Number(body.chargePercentage) > 100)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Charge must be between 0 and 100.",
    },
    { status: 400 }
  );
}

if (
  body.batteryHealth !== undefined &&
  (Number(body.batteryHealth) < 0 ||
    Number(body.batteryHealth) > 100)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Battery health must be between 0 and 100.",
    },
    { status: 400 }
  );
}

if (
  body.cycleCount !== undefined &&
  Number(body.cycleCount) < 0
) {
  return NextResponse.json(
    {
      success: false,
      message: "Cycle count cannot be negative.",
    },
    { status: 400 }
  );
}

    if (body.status === "READY") {
  body.chargePercentage = 100;
}

if (body.status === "CHARGING") {
  body.lastChargedAt = new Date();
}

    const battery = await Battery.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (
      battery?.vehicleId &&
      (String(battery.status || "") === "IN-VEHICLE" ||
        body.chargePercentage !== undefined)
    ) {
      await Vehicle.findOneAndUpdate(
        { vehicleId: battery.vehicleId },
        {
          $set: {
            batteryPercentage: Number(battery.chargePercentage || 0),
            currentBatteryId: battery.batteryId,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: battery,
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
        const gate = await requireAdminDashboards(...API_DASHBOARDS.batteries);
    if (gate.error) return gate.error;
    const blockedDelete = await denyStaffDeletes();
    if (blockedDelete) return blockedDelete;

        
    await connectDB();

    const { id } = await params;

    const battery = await Battery.findById(id);

if (!battery) {
  return NextResponse.json(
    {
      success: false,
      message: "Battery not found.",
    },
    { status: 404 }
  );
}

if (battery.vehicleId) {
  return NextResponse.json(
    {
      success: false,
      message: "Remove battery from vehicle before deleting.",
    },
    { status: 400 }
  );
}

    await Battery.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
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
