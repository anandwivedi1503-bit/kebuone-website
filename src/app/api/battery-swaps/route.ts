import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { writeAudit } from "@/lib/writeAudit";
import Battery from "@/models/Battery";
import BatterySwap from "@/models/BatterySwap";
import Vehicle from "@/models/Vehicle";

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;
  try {
    await session.abortTransaction();
  } catch {}
  await session.endSession();
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const swaps = await BatterySwap.find().sort({ createdAt: -1 }).limit(300).lean();

    return NextResponse.json({
      success: true,
      data: swaps,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
    });
  }
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
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

    const batteryAlreadyInstalled = await Battery.findOne({
      batteryId: body.batteryInId,
      status: "IN-VEHICLE",
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

    const batteryOut = await Battery.findOne({
      batteryId: body.batteryOutId,
    });

    if (batteryOut && batteryOut.vehicleId && batteryOut.vehicleId !== body.vehicleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Battery Out does not belong to the selected vehicle.",
        },
        { status: 400 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const swapDocs = await BatterySwap.create([body], { session });
    const swap = swapDocs[0];
    const now = new Date();
    const chargeIn = Math.max(
      0,
      Math.min(100, Number(body.batteryInPercentage ?? 100))
    );
    const chargeOut = Math.max(
      0,
      Math.min(100, Number(body.batteryOutPercentage ?? 0))
    );

    if (body.batteryOutId) {
      await Battery.findOneAndUpdate(
        { batteryId: String(body.batteryOutId).toUpperCase() },
        {
          $set: {
            status: "CHARGING",
            vehicleId: "",
            chargePercentage: chargeOut,
            lastSwappedAt: now,
          },
        },
        { session }
      );
    }

    if (body.batteryInId) {
      await Battery.findOneAndUpdate(
        { batteryId: String(body.batteryInId).toUpperCase() },
        {
          $set: {
            status: "IN-VEHICLE",
            vehicleId: String(body.vehicleId || "").toUpperCase(),
            chargePercentage: chargeIn,
            lastSwappedAt: now,
          },
          $inc: { cycleCount: 1 },
        },
        { session }
      );
    }

    if (body.vehicleId) {
      await Vehicle.findOneAndUpdate(
        { vehicleId: String(body.vehicleId).toUpperCase() },
        {
          $set: {
            batteryPercentage: chargeIn,
            lastBatterySwapAt: now,
            currentBatteryId: String(body.batteryInId || "").toUpperCase(),
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    await session.endSession();
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
    await rollback(session);
    return NextResponse.json({
      success: false,
      error,
    });
  }
}
