import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import WalletTransaction from "@/models/WalletTransaction";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { searchParams } =
      new URL(req.url);

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

    const riderId =
      searchParams
        .get("riderId")
        ?.trim()
        .toUpperCase();

    const type =
      searchParams
        .get("type")
        ?.trim();

    const status =
      searchParams
        .get("status")
        ?.trim();

    const filter: Record<string, unknown> = {
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    };

    if (riderId) {
      filter.riderId = riderId;
    }

    if (type) {
      filter.transactionType = type;
    }

    if (status) {
      filter.status = status;
    }

    const [transactions, total] =
      await Promise.all([
        WalletTransaction.find(filter)
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        WalletTransaction.countDocuments(
          filter
        ),
      ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          skip + transactions.length <
          total,
      },
    });
  } catch (error) {
    console.error(
      "WALLET TRANSACTIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch wallet transactions.",
      },
      { status: 500 }
    );
  }
}