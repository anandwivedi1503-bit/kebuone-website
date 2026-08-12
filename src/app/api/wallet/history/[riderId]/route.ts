import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import WalletTransaction from "@/models/WalletTransaction";
import Wallet from "@/models/Wallet";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ riderId: string }>;
  }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { riderId } = await params;

    const normalizedRiderId = String(riderId || "")
      .trim()
      .toUpperCase();

    if (!/^RDR-\d{6,}$/.test(normalizedRiderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Rider ID.",
        },
        { status: 400 }
      );
    }

    const wallet = await Wallet.findOne({
      riderId: normalizedRiderId,
      isDeleted: false,
    }).lean();

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

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
      ? Math.min(100, Math.max(1, Math.floor(rawLimit)))
      : 25;

    const skip = (page - 1) * limit;

    const type =
      searchParams.get("type")?.trim();

    const status =
      searchParams.get("status")?.trim();

    const filter: Record<string, unknown> = {
      riderId: normalizedRiderId,
      isDeleted: false,
    };

    if (type) {
      filter.transactionType = type;
    }

    if (status) {
      filter.status = status;
    }

    const [history, total] =
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
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          skip + history.length < total,
      },
    });
  } catch (error) {
    console.error(
      "WALLET HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch wallet history.",
      },
      { status: 500 }
    );
  }
}