import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import WalletTransaction from "@/models/WalletTransaction";

import {
  isAdminAuthenticated,
  requireAdminDashboards,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { denyIfRiderOutOfHub, idInScopeFilter, scopedRiderIds } from "@/lib/staffHubScope";
import { applyCreatedCursor, listResponseFromPage, withNextCursor } from "@/lib/listQuery";

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.walletRead);
    if (gate.error) return gate.error;

    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const rawPage = Number(
      searchParams.get("page") || 1
    );
    const cursor = String(searchParams.get("cursor") || "").trim();

    const rawLimit = Number(
      searchParams.get("limit") || 25
    );

    const page = Number.isFinite(rawPage)
      ? Math.max(1, Math.floor(rawPage))
      : 1;

    const limit = Number.isFinite(rawLimit)
      ? Math.min(
          100,
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
      const riderHubBlock = await denyIfRiderOutOfHub(gate.session, riderId);
      if (riderHubBlock) return riderHubBlock;
    } else {
      Object.assign(
        filter,
        idInScopeFilter("riderId", await scopedRiderIds(gate.session))
      );
    }

    if (type) {
      filter.transactionType = type;
    }

    if (status) {
      filter.status = status;
    }

    applyCreatedCursor(filter, cursor);
    const transactions = await WalletTransaction.find(filter)
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(cursor ? 0 : skip)
          .limit(limit + 1)
          .lean();
    const payload = listResponseFromPage(transactions, cursor ? 1 : page, limit);
    const pageRows = payload.data;
    const pagedPayload = withNextCursor(
      payload,
      pageRows[pageRows.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined
    );

    return NextResponse.json({
      ...pagedPayload,
      pagination: {
        ...pagedPayload.pagination,
        hasNextPage: pagedPayload.pagination.hasMore,
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
