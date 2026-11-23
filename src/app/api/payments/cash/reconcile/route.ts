import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { isMongoTransactionUnsupported } from "@/lib/mongoTransaction";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { scopedBookingIds } from "@/lib/staffHubScope";
import { writeAudit } from "@/lib/writeAudit";
import CashHandoverReconciliation from "@/models/CashHandoverReconciliation";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";
export const maxDuration = 60;

function money(value: unknown) {
  return Number(Number(value || 0).toFixed(2));
}

function cashScopeFilter(bookingIds: string[] | null) {
  const filter: Record<string, unknown> = {
    paymentMethod: "Cash",
    status: "Success",
    transactionType: "Booking Payment",
    ...NOT_DELETED_FILTER,
    $and: [
      {
        $or: [
          { cashHandoverStatus: "DueToCompany" },
          { cashHandoverStatus: "VarianceReview" },
          { cashHandoverStatus: "None", transactionType: "Booking Payment" },
          { cashHandoverStatus: { $exists: false }, transactionType: "Booking Payment" },
        ],
      },
    ],
  };
  if (bookingIds !== null) {
    (filter.$and as unknown[]).push({ bookingId: { $in: bookingIds } });
  }
  return filter;
}

function batchScopeFilter(bookingIds: string[] | null, status?: string) {
  const filter: Record<string, unknown> = status ? { status } : {};
  if (bookingIds !== null) {
    filter.$and = [
      { bookingIds: { $in: bookingIds } },
      { $expr: { $setIsSubset: ["$bookingIds", bookingIds] } },
    ];
  }
  return filter;
}

async function getCashHandoverState(bookingIds: string[] | null) {
  const due = (await Transaction.find(cashScopeFilter(bookingIds))
    .select("transactionId bookingId amount")
    .lean()) as Array<{ transactionId?: string; bookingId?: string; amount?: number }>;
  const openBatches = await CashHandoverReconciliation.find(batchScopeFilter(bookingIds, "VarianceReview"))
    .sort({ recordedAt: 1 })
    .limit(10)
    .lean();
  const recentBatches = await CashHandoverReconciliation.find(batchScopeFilter(bookingIds))
    .sort({ recordedAt: -1 })
    .limit(8)
    .lean();
  const varianceReviewCount = await Transaction.countDocuments({
    paymentMethod: "Cash",
    transactionType: "Booking Payment",
    status: "Success",
    cashHandoverStatus: "VarianceReview",
    ...NOT_DELETED_FILTER,
    ...(bookingIds === null ? {} : { bookingId: { $in: bookingIds } }),
  });

  return {
    pendingCount: due.length,
    expectedAmount: money(due.reduce((sum, item) => sum + Number(item.amount || 0), 0)),
    openBatches,
    recentBatches,
    varianceReviewCount,
  };
}

export async function GET() {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.cashHandover);
    if (gate.error || !gate.session) return gate.error || unauthorizedResponse();
    await connectDB();
    const bookingIds = await scopedBookingIds(gate.session);
    return NextResponse.json({ success: true, data: await getCashHandoverState(bookingIds) });
  } catch (error) {
    console.error("CASH RECONCILIATION SUMMARY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load cash handover totals." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireAdminDashboards(...API_DASHBOARDS.cashHandover);
  if (gate.error || !gate.session) return gate.error || unauthorizedResponse();
  try {
    await connectDB();
  } catch (error) {
    console.error("CASH RECONCILIATION DB CONNECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to connect to the transaction ledger." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid cash count request." }, { status: 400 });
  }

  const actualAmount = Number(body.actualAmount);
  const notes = String(body.notes || "").trim().slice(0, 500);
  const batchId = String(body.reconciliationId || "").trim();
  if (
    body.actualAmount === undefined ||
    body.actualAmount === null ||
    String(body.actualAmount).trim() === "" ||
    !Number.isFinite(actualAmount) ||
    actualAmount < 0
  ) {
    return NextResponse.json(
      { success: false, message: "Enter a valid cash count of ₹0 or more." },
      { status: 400 }
    );
  }

  let bookingIds: string[] | null;
  try {
    bookingIds = await scopedBookingIds(gate.session);
  } catch (error) {
    console.error("CASH RECONCILIATION SCOPE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to confirm your yard access scope." },
      { status: 503 }
    );
  }
  let session: mongoose.ClientSession | null = null;
  let auditId = "";
  let auditBookingId = "";
  let auditDetail = "";
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    if (batchId) {
      const batch = await CashHandoverReconciliation.findOne({
        reconciliationId: batchId,
        status: "VarianceReview",
        ...batchScopeFilter(bookingIds, "VarianceReview"),
      }).session(session);
      if (!batch) {
        await session.abortTransaction();
        await session.endSession();
        session = null;
        return NextResponse.json(
          { success: false, message: "Open cash variance was not found in your dashboard scope." },
          { status: 404 }
        );
      }
      if (bookingIds !== null && !batch.bookingIds.every((id: string) => bookingIds.includes(id))) {
        await session.abortTransaction();
        await session.endSession();
        session = null;
        return NextResponse.json(
          { success: false, message: "This cash variance includes bookings outside your hub access." },
          { status: 403 }
        );
      }

      const expectedAmount = money(batch.expectedAmount);
      const varianceAmount = money(actualAmount - expectedAmount);
      const countedAt = new Date();
      batch.actualAmount = money(actualAmount);
      batch.varianceAmount = varianceAmount;
      batch.notes = notes || batch.notes;
      batch.recounts.push({ actualAmount: money(actualAmount), countedBy: gate.session.username, countedAt, notes });
      const matched = Math.abs(varianceAmount) < 0.01;
      if (matched) batch.status = "Matched";
      await batch.save({ session });

      if (matched) {
        const update = await Transaction.updateMany(
          {
            transactionId: { $in: batch.transactionIds },
            cashHandoverStatus: "VarianceReview",
            cashHandoverBatchId: batchId,
          },
          {
            $set: {
              cashHandoverStatus: "HandedOver",
              handedOverAt: countedAt,
              handedOverBy: gate.session.username,
              handoverNotes: notes || batch.notes,
              updatedBy: gate.session.username,
            },
          },
          { session }
        );
        if (Number(update.modifiedCount || 0) !== batch.transactionIds.length) {
          throw new Error("Some cash receipts changed while resolving the variance.");
        }
      }

      await session.commitTransaction();
      await session.endSession();
      session = null;
      auditId = batchId;
      auditBookingId = String(batch.bookingIds[0] || "");
      auditDetail = matched
        ? `Variance reconciled at INR ${money(actualAmount).toFixed(2)}`
        : `Cash recount INR ${money(actualAmount).toFixed(2)} · variance INR ${varianceAmount.toFixed(2)}`;
      void writeAudit({
        actor: gate.session.username,
        action: matched ? "CASH_HANDOVER_RECONCILED" : "CASH_HANDOVER_RECOUNTED",
        entity: "CashHandoverReconciliation",
        entityId: auditId,
        bookingId: auditBookingId,
        detail: auditDetail,
      });
      return NextResponse.json({
        success: true,
        data: { reconciliationId: batchId, expectedAmount, actualAmount: money(actualAmount), varianceAmount, status: batch.status },
        message: matched
          ? "Cash count matches. Receipts are marked as handed over."
          : `Count saved. Difference from expected: ₹${Math.abs(varianceAmount).toFixed(2)}. This batch remains in variance review.`,
      });
    }

    const openVariance = await CashHandoverReconciliation.findOne(batchScopeFilter(bookingIds))
      .select("reconciliationId")
      .session(session);
    if (openVariance) {
      await session.abortTransaction();
      await session.endSession();
      session = null;
      return NextResponse.json(
        { success: false, message: `Resolve cash variance ${openVariance.reconciliationId} before starting another handover.` },
        { status: 409 }
      );
    }

    const due = (await Transaction.find(cashScopeFilter(bookingIds))
      .select("transactionId bookingId amount")
      .session(session)
      .lean()) as Array<{ transactionId?: string; bookingId?: string; amount?: number }>;
    if (!due.length) {
      await session.abortTransaction();
      await session.endSession();
      session = null;
      return NextResponse.json(
        { success: false, message: "There is no yard cash due for handover in your dashboard scope." },
        { status: 400 }
      );
    }

    const transactionIds = due.map((item) => String(item.transactionId || "")).filter(Boolean);
    const selectedBookingIds = Array.from(new Set(due.map((item) => String(item.bookingId || "")).filter(Boolean)));
    const expectedAmount = money(due.reduce((sum, item) => sum + Number(item.amount || 0), 0));
    const varianceAmount = money(actualAmount - expectedAmount);
    const matched = Math.abs(varianceAmount) < 0.01;
    const reconciliationId = `CASH-HO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const recordedAt = new Date();
    const batch = new CashHandoverReconciliation({
      reconciliationId,
      transactionIds,
      bookingIds: selectedBookingIds,
      expectedAmount,
      actualAmount: money(actualAmount),
      varianceAmount,
      status: matched ? "Matched" : "VarianceReview",
      recordedBy: gate.session.username,
      recordedAt,
      notes,
      recounts: [{ actualAmount: money(actualAmount), countedBy: gate.session.username, countedAt: recordedAt, notes }],
    });
    await batch.save({ session });

    const update = await Transaction.updateMany(
      { _id: { $in: due.map((item: any) => item._id).filter(Boolean) }, ...cashScopeFilter(bookingIds) },
      {
        $set: {
          cashHandoverStatus: matched ? "HandedOver" : "VarianceReview",
          cashHandoverBatchId: reconciliationId,
          ...(matched
            ? {
                handedOverAt: recordedAt,
                handedOverBy: gate.session.username,
                handoverNotes: notes,
                updatedBy: gate.session.username,
              }
            : {}),
        },
      },
      { session }
    );
    if (Number(update.modifiedCount || 0) !== due.length) {
      throw new Error("Some cash receipts changed while recording the handover.");
    }

    await session.commitTransaction();
    await session.endSession();
    session = null;
    auditId = reconciliationId;
    auditBookingId = selectedBookingIds[0] || "";
    auditDetail = `Expected INR ${expectedAmount.toFixed(2)} · counted INR ${money(actualAmount).toFixed(2)} · variance INR ${varianceAmount.toFixed(2)}`;
    void writeAudit({
      actor: gate.session.username,
      action: matched ? "CASH_HANDOVER_RECONCILED" : "CASH_HANDOVER_VARIANCE",
      entity: "CashHandoverReconciliation",
      entityId: auditId,
      bookingId: auditBookingId,
      detail: auditDetail,
    });

    return NextResponse.json({
      success: true,
      data: { reconciliationId, pendingCount: due.length, expectedAmount, actualAmount: money(actualAmount), varianceAmount, status: matched ? "Matched" : "VarianceReview" },
      message: matched
        ? `${due.length} cash receipt${due.length === 1 ? "" : "s"} reconciled and marked as handed over.`
        : `Count saved. Difference from expected: ₹${Math.abs(varianceAmount).toFixed(2)}. Receipts are held in variance review until the count matches.`,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        await session.endSession();
      } catch {}
    }
    if (isMongoTransactionUnsupported(error)) {
      return NextResponse.json(
        { success: false, message: "Cash reconciliation requires the database replica set. No handover status was changed." },
        { status: 503 }
      );
    }
    console.error("CASH RECONCILIATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save cash reconciliation. No handover status was changed." },
      { status: 500 }
    );
  }
}
