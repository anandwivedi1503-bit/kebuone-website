import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Wallet from "@/models/Wallet";
import Rider from "@/models/Rider";

import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    /*
     * ADMIN AUTHENTICATION
     */
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    /*
     * Validate MongoDB ObjectId before querying.
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid wallet ID.",
        },
        { status: 400 }
      );
    }

    /*
     * START ATOMIC TRANSACTION
     */
    session = await mongoose.startSession();
    session.startTransaction();

    const wallet = await Wallet.findById(id).session(
      session
    );

    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Wallet already soft-deleted.
     */
    if (wallet.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Wallet is already closed.",
        },
        { status: 410 }
      );
    }

    /*
     * Wallet must have zero available balance
     * before it can be permanently closed
     * logically.
     */
    if (Number(wallet.balance) > 0) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet with balance cannot be closed.",
        },
        { status: 400 }
      );
    }

    /*
     * Security deposit must be completely released.
     */
    if (
      Number(wallet.securityDepositHold) > 0
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Security deposit is still on hold.",
        },
        { status: 400 }
      );
    }

    /*
     * Frozen funds must also be completely released.
     */
    if (Number(wallet.freezeAmount) > 0) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet has frozen funds and cannot be closed.",
        },
        { status: 400 }
      );
    }

    /*
     * Find the linked rider.
     */
    const rider = await Rider.findOne({
      riderId: wallet.riderId,
      isDeleted: false,
    }).session(session);

    /*
     * A wallet should not be closed while
     * its rider is currently on a ride.
     */
    if (rider?.activeRide) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet cannot be closed while rider has an active ride.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    /*
     * SOFT DELETE WALLET
     *
     * We do not physically remove financial
     * records from MongoDB.
     */
    wallet.status = "Blocked";
    wallet.isDeleted = true;
    wallet.deletedAt = now;
    wallet.updatedBy = "Admin";
    wallet.version += 1;

    await wallet.save({
      session,
      validateBeforeSave: true,
    });

    /*
     * Disable rider booking if rider still exists.
     *
     * We intentionally do NOT change rider.status.
     *
     * Wallet state and rider account state are
     * separate business concepts.
     */
    if (rider) {
      rider.bookingEnabled = false;
      rider.updatedBy = "Admin";
      rider.version += 1;

      await rider.save({
        session,
        validateBeforeSave: true,
      });
    }

    /*
     * COMMIT
     */
    await session.commitTransaction();

    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message: "Wallet closed successfully.",
    });
  } catch (error) {
    /*
     * ROLLBACK
     */
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error(
      "WALLET CLOSE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to close wallet.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    /*
     * ADMIN AUTHENTICATION
     */
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    /*
     * Validate MongoDB ObjectId.
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid wallet ID.",
        },
        { status: 400 }
      );
    }

    /*
     * Parse request.
     */
    const body = await req.json();

    const status = String(
      body.status || ""
    ).trim();

    if (
      !["Active", "Blocked"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet status must be Active or Blocked.",
        },
        { status: 400 }
      );
    }

    /*
     * START TRANSACTION
     */
    session = await mongoose.startSession();
    session.startTransaction();

    const wallet = await Wallet.findById(id).session(
      session
    );

    if (!wallet || wallet.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Find linked rider.
     */
    const rider = await Rider.findOne({
      riderId: wallet.riderId,
      isDeleted: false,
    }).session(session);

    if (!rider) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Rider linked to wallet was not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ACTIVATE WALLET
     */
  /*
 * ACTIVATE WALLET
 */
if (status === "Active") {
  /*
   * Wallet can only become active when
   * the rider itself is fully eligible.
   */
  if (
    rider.approvalStatus !== "Approved" ||
    rider.kycStatus !== "Approved" ||
    rider.status !== "Active" ||
    rider.blacklisted
  ) {
    await session.abortTransaction();
    session.endSession();
    session = null;

    return NextResponse.json(
      {
        success: false,
        message:
          "Wallet cannot be activated until the rider is fully approved, active, and not blacklisted.",
      },
      { status: 409 }
    );
  }

  if (rider.activeRide) {
    await session.abortTransaction();
    session.endSession();
    session = null;

    return NextResponse.json(
      {
        success: false,
        message:
          "Wallet cannot be activated while rider has an active ride.",
      },
      { status: 409 }
    );
  }

  /*
   * Explicit admin activation removes
   * the manual wallet block.
   */
  wallet.status = "Active";
  wallet.adminBlocked = false;
  wallet.adminBlockedAt = undefined;
  wallet.adminBlockedBy = "";

  rider.bookingEnabled = true;
  rider.updatedBy = "Admin";
  rider.version += 1;
}

/*
 * BLOCK WALLET
 */
if (status === "Blocked") {
  if (rider.activeRide) {
    await session.abortTransaction();
    session.endSession();
    session = null;

    return NextResponse.json(
      {
        success: false,
        message:
          "Wallet cannot be blocked while rider has an active ride.",
      },
      { status: 409 }
    );
  }

  wallet.status = "Blocked";

  /*
   * This is a deliberate administrative block.
   *
   * Rider PATCH will respect this block and
   * will NOT automatically reactivate the wallet.
   */
  wallet.adminBlocked = true;
  wallet.adminBlockedAt = new Date();
  wallet.adminBlockedBy = "Admin";

  rider.bookingEnabled = false;
  rider.updatedBy = "Admin";
  rider.version += 1;
}

    /*
     * Update wallet version.
     */
    wallet.updatedBy = "Admin";
    wallet.version += 1;

    await wallet.save({
      session,
      validateBeforeSave: true,
    });

    await rider.save({
      session,
      validateBeforeSave: true,
    });

    /*
     * COMMIT
     */
    await session.commitTransaction();

    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message:
        status === "Active"
          ? "Wallet activated successfully."
          : "Wallet blocked successfully.",
      data: wallet,
    });
  } catch (error) {
    /*
     * ROLLBACK
     */
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error(
      "WALLET STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update wallet status.",
      },
      { status: 500 }
    );
   }
 }