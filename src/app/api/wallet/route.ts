import {
  isAdminAuthenticated,
  requireAdminDashboards,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Wallet from "@/models/Wallet";
import Rider from "@/models/Rider";
import { attachLiveBookingsByRider } from "@/lib/opsMoneySummary";
import { denyIfRiderOutOfHub, idInScopeFilter, scopedRiderIds } from "@/lib/staffHubScope";

import mongoose from "mongoose";

function normalizeRiderId(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function isValidRiderId(riderId: string) {
  return /^RDR-\d{6,}$/.test(riderId);
}

type RiderWalletRecoveryRecord = {
  _id: mongoose.Types.ObjectId;
  riderId: string;
  fullName: string;
  phone: string;
  approvalStatus: string;
  kycStatus: string;
  status: string;
  blacklisted: boolean;
  isDeleted: boolean;
};

/*
 * GET
 *
 * Returns active wallet records for the admin wallet
 * management module.
 *
 * Supports:
 *
 * ?page=1
 * ?limit=25
 * ?status=Active
 * ?status=Blocked
 * ?riderId=RDR-000001
 */
export async function GET(req: Request) {
  try {
    /*
     * ADMIN AUTHENTICATION
     */
    const gate = await requireAdminDashboards(...API_DASHBOARDS.walletRead);
    if (gate.error) return gate.error;

    await connectDB();

    const { searchParams } = new URL(req.url);

    /*
     * Pagination
     */
    const rawPage = Number(
      searchParams.get("page") || 1
    );

    const rawLimit = Number(
      searchParams.get("limit") || 25
    );

    const page = Number.isFinite(rawPage)
      ? Math.max(1, Math.floor(rawPage))
      : 1;

    const limit = Number.isFinite(rawLimit)
      ? Math.min(
          500,
          Math.max(1, Math.floor(rawLimit))
        )
      : 25;

    const skip = (page - 1) * limit;

    /*
     * Filters
     */
    const status =
      searchParams.get("status")?.trim();

    const riderId = normalizeRiderId(
      searchParams.get("riderId")
    );

    const filter: Record<string, unknown> = {
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    };

    /*
     * Wallet status filter
     */
    if (status) {
      if (
        !["Active", "Blocked"].includes(status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid wallet status.",
          },
          { status: 400 }
        );
      }

      filter.status = status;
    }

    /*
     * Rider ID filter
     */
    if (riderId) {
      if (!isValidRiderId(riderId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Rider ID.",
          },
          { status: 400 }
        );
      }

      filter.riderId = riderId;
      const riderHubBlock = await denyIfRiderOutOfHub(gate.session, riderId);
      if (riderHubBlock) return riderHubBlock;
    } else {
      Object.assign(
        filter,
        idInScopeFilter("riderId", await scopedRiderIds(gate.session))
      );
    }

    /*
     * Fetch wallets and total count in parallel.
     */
    const [wallets, total] =
      await Promise.all([
        Wallet.find(filter)
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Wallet.countDocuments(filter),
      ]);

    const data = await attachLiveBookingsByRider(wallets as Array<Record<string, unknown>>);

    /*
     * Return paginated wallet data.
     */
    return NextResponse.json({
      success: true,

      data,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(total / limit),

        hasNextPage:
          skip + wallets.length < total,
      },
    });
  } catch (error) {
    console.error(
      "GET WALLETS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wallets.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Controlled wallet recovery endpoint.
 *
 * IMPORTANT:
 *
 * Normal rider registration should create the
 * wallet automatically.
 *
 * This endpoint exists only for an administrator
 * to recover a missing wallet.
 */
export async function POST(req: Request) {
  try {
    /*
     * ADMIN AUTHENTICATION
     */
    const gate = await requireAdminDashboards(...API_DASHBOARDS.walletWrite);
    if (gate.error) return gate.error;

    await connectDB();

    const body = await req.json();

    const riderId = normalizeRiderId(body.riderId);

    /*
     * Validate Rider ID.
     */
    if (!isValidRiderId(riderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Rider ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * The client is NOT allowed to control:
     *
     * - balance
     * - userId
     * - userName
     * - phone
     * - wallet status
     *
     * These values come from the Rider record.
     */

    const rider =
      await Rider.findOne({
        riderId,
        isDeleted: false,
      }).lean<RiderWalletRecoveryRecord | null>();

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    const riderHubBlock = await denyIfRiderOutOfHub(gate.session, riderId);
    if (riderHubBlock) return riderHubBlock;

    /*
     * Check whether a wallet already exists.
     *
     * We check both active and soft-deleted wallets.
     */
    const existingWallet =
  await Wallet.findOne({
    riderId,
  })
    .select("isDeleted")
    .lean<{ isDeleted: boolean } | null>();

if (existingWallet) {
  return NextResponse.json(
    {
      success: false,
      message: existingWallet.isDeleted
        ? "A closed wallet already exists for this rider."
        : "Wallet already exists for this rider.",
    },
    { status: 409 }
  );
}

    /*
     * Determine initial wallet status strictly
     * from the rider's current eligibility.
     */
    const walletStatus =
      rider.approvalStatus === "Approved" &&
      rider.kycStatus === "Approved" &&
      rider.status === "Active" &&
      !rider.blacklisted
        ? "Active"
        : "Blocked";

    /*
     * Create wallet using server-controlled data.
     */
    const wallet = await Wallet.create({
      riderId: rider.riderId,

      userId: rider._id,

      userName: rider.fullName,

      phone: rider.phone,

      balance: 0,

      securityDepositHold: 0,

      freezeAmount: 0,

      totalRecharge: 0,

      totalSpent: 0,

      totalRefund: 0,

      status: walletStatus,

      isDeleted: false,

      updatedBy: "Admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Wallet created successfully.",
        data: wallet,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "CREATE WALLET ERROR:",
      error
    );

    /*
     * Duplicate wallet protection.
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet already exists for this rider.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create wallet.",
      },
      { status: 500 }
    );
   }
 }