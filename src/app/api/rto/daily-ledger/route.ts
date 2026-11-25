import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { applyCreatedCursor, listResponseFromPage, withNextCursor } from "@/lib/listQuery";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";

function indiaTodayRange(now = new Date()) {
  const indiaOffset = 330 * 60 * 1000;
  const indiaNow = new Date(now.getTime() + indiaOffset);
  const start = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth(),
    indiaNow.getUTCDate()
  ) - indiaOffset;
  return { $gte: new Date(start), $lt: new Date(start + 24 * 60 * 60 * 1000) };
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
    if (gate.error) return gate.error;
    await connectDB();

    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "100", 10) || 100));
    const contractCursor = String(url.searchParams.get("contractCursor") || "").trim();
    const receiptCursor = String(url.searchParams.get("receiptCursor") || "").trim();
    const hubs = await resolveHubScope(gate.session);
    const contractFilter: Record<string, unknown> = {
      $and: [
        NOT_DELETED_FILTER,
        { rentalMode: "Rent To Own" },
        applyHubScope({}, hubs, ["currentHub", "startHub"]),
      ],
    };
    const summaryFilter = { ...contractFilter };
    applyCreatedCursor(contractFilter, contractCursor);
    const todayRange = indiaTodayRange();
    const bookingScopeMatch = Array.isArray(hubs)
      ? {
          $or: [
            { "booking.currentHub": { $in: hubs.length ? hubs : ["__none__"] } },
            { "booking.startHub": { $in: hubs.length ? hubs : ["__none__"] } },
          ],
        }
      : {};

    const [contractRows, summaryRows] = await Promise.all([
      Booking.find(contractFilter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .select(
          "bookingId riderId userName userPhone vehicleId pendingAmount receivedAmount rtoInstallmentsPaid remainingRentToOwnDays rtoNextInstallmentAt ownershipTransferred rideStatus paymentStatus createdAt"
        )
        .lean(),
      Booking.aggregate([
        { $match: summaryFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  { $in: ["$rideStatus", ["Booked", "Payment Pending", "Ready For Pickup", "In Ride"]] },
                  1,
                  0,
                ],
              },
            },
            transferred: { $sum: { $cond: [{ $eq: ["$ownershipTransferred", true] }, 1, 0] } },
            received: { $sum: { $ifNull: ["$receivedAmount", 0] } },
          },
        },
      ]),
    ]);
    const contractPayload = listResponseFromPage(contractRows, 1, limit);
    const pagedContracts = withNextCursor(
      contractPayload,
      contractPayload.data[contractPayload.data.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined
    );

    const receiptPageFilter: Record<string, unknown> = {
      status: "Success",
      ...NOT_DELETED_FILTER,
    };
    applyCreatedCursor(receiptPageFilter, receiptCursor);
    const rtoReceiptPipeline = [
      { $match: { status: "Success", ...NOT_DELETED_FILTER } },
      {
        $lookup: {
          from: Booking.collection.name,
          localField: "bookingId",
          foreignField: "bookingId",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.rentalMode": "Rent To Own",
          $and: [
            {
              $or: [
                { "booking.isDeleted": false },
                { "booking.isDeleted": { $exists: false } },
              ],
            },
            bookingScopeMatch,
          ],
        },
      },
    ];
    const [receiptRows, todayReceiptSummaryRows] = await Promise.all([
      Transaction.aggregate([
        ...rtoReceiptPipeline,
        { $match: receiptPageFilter },
        { $sort: { createdAt: -1, _id: -1 } },
        { $limit: limit + 1 },
        {
          $project: {
            transactionId: 1,
            bookingId: 1,
            userName: 1,
            amount: 1,
            gstAmount: 1,
            paymentMethod: 1,
            invoiceNumber: 1,
            remarks: 1,
            createdAt: 1,
            status: 1,
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: todayRange, status: "Success", ...NOT_DELETED_FILTER } },
        ...rtoReceiptPipeline.slice(1),
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
      ]),
    ]);
    const receiptPayload = listResponseFromPage(receiptRows, 1, limit);
    const pagedReceipts = withNextCursor(
      receiptPayload,
      receiptPayload.data[receiptPayload.data.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined
    );

    return NextResponse.json({
      success: true,
      data: { contracts: pagedContracts.data, receipts: pagedReceipts.data },
      contractPagination: pagedContracts.pagination,
      receiptPagination: pagedReceipts.pagination,
      summary: {
        ...(summaryRows[0] || { total: 0, active: 0, transferred: 0, received: 0 }),
        todayReceiptCount: todayReceiptSummaryRows[0]?.count || 0,
        todayReceived: todayReceiptSummaryRows[0]?.amount || 0,
      },
    });
  } catch (error) {
    console.error("RTO LEDGER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load Rent to Own ledger." },
      { status: 500 }
    );
  }
}
