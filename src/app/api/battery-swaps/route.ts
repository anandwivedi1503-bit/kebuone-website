import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import {
  abortOptionalTransaction,
  commitOptionalTransaction,
  isMongoTransactionUnsupported,
  sessionOpts,
  startOptionalTransaction,
} from "@/lib/mongoTransaction";
import {
  applyHubScope,
  hubForbiddenResponse,
  sessionHubScope,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";
import { writeAudit } from "@/lib/writeAudit";
import Battery from "@/models/Battery";
import BatterySwap from "@/models/BatterySwap";
import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.swaps);
    if (gate.error) return gate.error;
    if (!gate.session) return unauthorizedResponse();
    await connectDB();

    const filter = applyHubScope(
      {},
      sessionHubScope(gate.session),
      ["hubId"]
    );
    const swaps = await BatterySwap.find(filter).sort({ createdAt: -1 }).limit(300).lean();

    return NextResponse.json({
      success: true,
      data: swaps,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch battery swaps.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.swaps);
    if (gate.error) return gate.error;
    if (!gate.session) return unauthorizedResponse();
    await connectDB();

    const body = await req.json();
    const existingSwap = await BatterySwap.findOne({
      swapId: body.swapId,
    });

    if (existingSwap) {
      return NextResponse.json(
        {
          success: false,
          message: "Swap ID already exists.",
        },
        { status: 409 }
      );
    }

    const vehicleId = String(body.vehicleId || "").trim().toUpperCase();
    const batteryInId = String(body.batteryInId || "").trim().toUpperCase();
    let batteryOutId = String(body.batteryOutId || "").trim().toUpperCase();

    if (!vehicleId || !batteryInId) {
      return NextResponse.json(
        { success: false, message: "Vehicle and charged battery in are required." },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found." },
        { status: 404 }
      );
    }
    if (
      !staffCanAccessBooking(gate.session, {
        currentHub: vehicle.currentHub,
        startHub: vehicle.currentHub,
      })
    ) {
      return hubForbiddenResponse();
    }

    if (!batteryOutId) {
      batteryOutId = String(vehicle.currentBatteryId || "").trim().toUpperCase();
    }

    const batteryAlreadyInstalled = await Battery.findOne({
      batteryId: batteryInId,
      status: "IN-VEHICLE",
      vehicleId: { $ne: vehicleId },
    });

    if (batteryAlreadyInstalled) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected battery is already installed in another vehicle.",
        },
        { status: 400 }
      );
    }

    const batteryOut = batteryOutId
      ? await Battery.findOne({ batteryId: batteryOutId })
      : null;

    if (batteryOut && batteryOut.vehicleId && batteryOut.vehicleId !== vehicleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Battery Out does not belong to the selected vehicle.",
        },
        { status: 400 }
      );
    }

    const batteryIn = await Battery.findOne({ batteryId: batteryInId });
    if (!batteryIn) {
      return NextResponse.json(
        { success: false, message: "Charged battery in was not found in inventory." },
        { status: 404 }
      );
    }
    if (!["READY", "CHARGING"].includes(String(batteryIn.status || ""))) {
      return NextResponse.json(
        {
          success: false,
          message: "Battery in must be READY (or charging at the hub) before it goes on a scooter.",
        },
        { status: 400 }
      );
    }

    if (batteryOutId && batteryOutId === batteryInId) {
      return NextResponse.json(
        { success: false, message: "Battery in and battery out cannot be the same pack." },
        { status: 400 }
      );
    }

    let booking = vehicle.currentBookingId
      ? await Booking.findOne({ bookingId: vehicle.currentBookingId })
      : null;
    if (!booking) {
      booking = await Booking.findOne({
        vehicleId,
        rideStatus: {
          $in: ["Booked", "Payment Pending", "Ready For Pickup", "In Ride"],
        },
      }).sort({ updatedAt: -1 });
    }

    session = await startOptionalTransaction();

    const riderId = String(
      body.riderId || booking?.riderId || vehicle.currentRiderId || vehicle.assignedRider || ""
    ).trim();
    const now = new Date();
    const chargeIn = Math.max(
      0,
      Math.min(100, Number(body.batteryInPercentage ?? batteryIn.chargePercentage ?? 100))
    );
    const chargeOut = Math.max(
      0,
      Math.min(100, Number(body.batteryOutPercentage ?? batteryOut?.chargePercentage ?? 0))
    );

    const swapDocs = await BatterySwap.create(
      [
        {
          swapId: String(body.swapId || `SWAP-${Date.now()}`).toUpperCase(),
          hubId: String(body.hubId || batteryIn.hubId || "").trim(),
          hubName: String(body.hubName || vehicle.currentHub || batteryIn.hubName || ""),
          vehicleId,
          batteryOutId: batteryOutId || "PACK-OUT",
          batteryInId,
          batteryOutPercentage: chargeOut,
          batteryInPercentage: chargeIn,
          riderId,
          staffId: String(body.staffId || "").trim(),
          remarks: String(body.remarks || "").trim().slice(0, 500),
          status: "COMPLETED",
        },
      ],
      sessionOpts(session)
    );
    const swap = swapDocs[0];

    if (batteryOutId) {
      await Battery.findOneAndUpdate(
        { batteryId: batteryOutId },
        {
          $set: {
            status: "CHARGING",
            vehicleId: "",
            chargePercentage: chargeOut,
            lastSwappedAt: now,
          },
        },
        { ...sessionOpts(session) }
      );
    }

    await Battery.findOneAndUpdate(
      { batteryId: batteryInId },
      {
        $set: {
          status: "IN-VEHICLE",
          vehicleId,
          chargePercentage: chargeIn,
          lastSwappedAt: now,
        },
        $inc: { cycleCount: 1 },
      },
      sessionOpts(session)
    );

    const keepRideStatus = ["Booked", "Ready For Pickup", "In Ride"].includes(
      String(vehicle.vehicleStatus || "")
    );
    const nextVehicleStatus = keepRideStatus
      ? vehicle.vehicleStatus
      : chargeIn < 20
        ? "Low Battery"
        : "Available";

    await Vehicle.findOneAndUpdate(
      { vehicleId },
      {
        $set: {
          batteryPercentage: chargeIn,
          lastBatterySwapAt: now,
          currentBatteryId: batteryInId,
          vehicleStatus: nextVehicleStatus,
        },
      },
      sessionOpts(session)
    );

    if (booking) {
      booking.batteryPercentage = chargeIn;
      await booking.save(sessionOpts(session));
    }

    await commitOptionalTransaction(session);
    session = null;

    void writeAudit({
      actor: "Admin",
      action: "BATTERY_SWAP",
      entity: "BatterySwap",
      entityId: String(swap.swapId || ""),
      riderId: String(swap.riderId || ""),
      detail: `${swap.vehicleId} · out ${swap.batteryOutId} · in ${swap.batteryInId}`,
    });

    return NextResponse.json({
      success: true,
      data: swap,
    });
  } catch (error) {
    await abortOptionalTransaction(session);
    session = null;
    if (isMongoTransactionUnsupported(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Battery swap needs a replica-set database or a retry without transactions.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to record battery swap.",
      },
      { status: 500 }
    );
  }
}
