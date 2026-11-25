import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { money } from "@/lib/gst";
import { appendBoundedText } from "@/lib/listQuery";
import { releaseSecurityDepositHoldOnce } from "@/lib/securityDepositHold";
import Booking from "@/models/Booking";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { notifyRefundReceipt } from "@/lib/notify/refundNotify";
import { writeAudit } from "@/lib/writeAudit";

type GatewayRefund = {
  id: string;
  paymentId?: string;
  amount: number;
  status: "pending" | "processed" | "failed";
};

function isDepositRefund(refund: { refundSource?: unknown; remarks?: unknown }) {
  return (
    String(refund.refundSource || "") === "Security Deposit" ||
    /security deposit/i.test(String(refund.remarks || ""))
  );
}

/**
 * Record Razorpay refund webhooks and settle the EVUDDY ledger only after every
 * gateway refund created for this refund request has actually been processed.
 * Processed partial gateway refunds are still recorded idempotently as they land.
 */
export async function reconcileRazorpayRefund(input: {
  refundDocumentId?: string;
  gatewayRefundId?: string;
  gatewayStatus?: "processed" | "failed";
  gatewayAmountPaise?: number;
}) {
  await connectDB();
  const session = await mongoose.startSession();
  let notifyData:
    | {
        refundId: string;
        bookingId: string;
        riderId: string;
        amount: number;
        gatewayTxnId: string;
        razorpayRefundId: string;
        deposit: boolean;
      }
    | undefined;
  let resultingStatus = "PROCESSING";

  try {
    session.startTransaction();
    const refund = input.refundDocumentId
      ? await Refund.findById(input.refundDocumentId).session(session)
      : await Refund.findOne({
          $or: [
            { razorpayRefundId: input.gatewayRefundId },
            { "razorpayRefunds.id": input.gatewayRefundId },
          ],
        }).session(session);

    if (!refund) {
      await session.abortTransaction();
      return { found: false, status: "NOT_FOUND" as const };
    }

    if (refund.refundStatus === "REFUNDED") {
      await session.abortTransaction();
      return { found: true, status: "REFUNDED" as const };
    }

    const details = (refund.razorpayRefunds || []).map((item) => ({
      id: String(item.id || ""),
      paymentId: String(item.paymentId || ""),
      amount: money(Number(item.amount || 0)),
      status: String(item.status || "pending").toLowerCase() as GatewayRefund["status"],
    }));

    // Backward compatibility for refund rows created before gateway refund
    // details were stored as an array.
    if (details.length === 0 && refund.razorpayRefundId) {
      details.push({
        id: String(refund.razorpayRefundId),
        paymentId: "",
        amount: money(Number(refund.amount || 0)),
        status: "pending",
      });
    }

    if (input.gatewayRefundId && input.gatewayStatus) {
      let detail = details.find((item) => item.id === input.gatewayRefundId);
      if (!detail) {
        detail = {
          id: input.gatewayRefundId,
          paymentId: "",
          amount: money(Number(input.gatewayAmountPaise || 0) / 100),
          status: "pending",
        };
        details.push(detail);
      }
      detail.status = input.gatewayStatus;
      if (input.gatewayAmountPaise && input.gatewayAmountPaise > 0) {
        detail.amount = money(input.gatewayAmountPaise / 100);
      }
    }

    if (details.length === 0) {
      await session.abortTransaction();
      return { found: true, status: "PROCESSING" as const };
    }

    refund.razorpayRefunds = details;
    refund.markModified("razorpayRefunds");
    refund.razorpayRefundId = refund.razorpayRefundId || details[0].id;
    refund.gatewayTxnId = details.map((item) => item.id).join(",").slice(0, 100);
    refund.paymentGateway = "Razorpay";

    const booking = await Booking.findOne({ bookingId: refund.bookingId }).session(session);
    if (!booking) {
      await session.abortTransaction();
      return { found: true, status: "BOOKING_NOT_FOUND" as const };
    }

    for (const detail of details) {
      if (detail.status !== "processed" || detail.amount <= 0) continue;
      const transactionId = `RF-${refund.refundId}-${detail.id}`.slice(0, 100);
      const alreadyRecorded = await Transaction.findOne({ transactionId }).session(session);
      if (alreadyRecorded) continue;
      await Transaction.create(
        [
          {
            transactionId,
            bookingId: booking.bookingId,
            userId: String(booking.userId),
            userName: booking.userName,
            amount: detail.amount,
            paymentMethod: "Razorpay",
            transactionType: "Refund",
            status: "Success",
            refundStatus: "Completed",
            invoiceNumber: `INV-${transactionId}`.slice(0, 100),
            invoiceGenerated: true,
            razorpayPaymentId: detail.paymentId,
            remarks: `Razorpay refund ${detail.id}`,
            transactionSource: "Admin Panel",
          },
        ],
        { session }
      );
    }

    const failed = details.some((item) => item.status === "failed");
    const allProcessed = details.every((item) => item.status === "processed");
    const requestedAmount = money(Number(refund.amount || 0));
    const processedAmount = money(
      details
        .filter((item) => item.status === "processed")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    );
    if (failed) {
      refund.refundStatus = "FAILED";
      refund.failureReason = "Razorpay reported a failed refund. Check gateway refund IDs and reconcile any partial refund before retrying.";
    } else if (allProcessed && Math.abs(processedAmount - requestedAmount) > 0.009) {
      refund.refundStatus = "FAILED";
      refund.failureReason = `Razorpay processed ₹${processedAmount.toFixed(2)} of the requested ₹${requestedAmount.toFixed(2)}. Reconcile the partial refund before retrying.`;
    } else if (allProcessed) {
      const amount = requestedAmount;
      const isDeposit = isDepositRefund(refund);
      const currentRefundAmount = money(Number(booking.refundAmount || 0));
      if (!isDeposit || currentRefundAmount + 0.009 < amount) {
        booking.refundAmount = money(currentRefundAmount + amount);
      }
      if (isDeposit) booking.securityDepositRefunded = true;
      booking.remarks = appendBoundedText(
        booking.remarks,
        `Refund completed via Razorpay\nRefund ID: ${refund.refundId}\nAmount: ₹${amount}`
      );
      await booking.save({ session });

      if (isDeposit) {
        await Rider.findOneAndUpdate(
          { riderId: booking.riderId },
          { securityDeposit: 0 },
          { session }
        );
        const wallet = await Wallet.findOne({ riderId: booking.riderId }).session(session);
        if (wallet) {
          await releaseSecurityDepositHoldOnce(
            booking,
            session,
            "Hold released after Razorpay security-deposit refund was processed"
          );
        }
      }

      refund.refundStatus = "REFUNDED";
      refund.processedAt = new Date();
      refund.processedBy = "Razorpay webhook";
      refund.failureReason = "";
      notifyData = {
        refundId: String(refund.refundId),
        bookingId: String(booking.bookingId),
        riderId: String(refund.riderId || booking.riderId || ""),
        amount,
        gatewayTxnId: String(refund.gatewayTxnId || ""),
        razorpayRefundId: String(refund.razorpayRefundId || ""),
        deposit: isDeposit,
      };
      resultingStatus = "REFUNDED";
    } else {
      refund.refundStatus = "PROCESSING";
    }

    if (refund.refundStatus === "FAILED") resultingStatus = "FAILED";

    await refund.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  if (notifyData) {
    const rider = await Rider.findOne({ riderId: notifyData.riderId }).lean() as {
      fullName?: string;
      phone?: string;
      email?: string;
    } | null;
    const booking = await Booking.findOne({ bookingId: notifyData.bookingId }).lean() as {
      userName?: string;
      userPhone?: string;
      userEmail?: string;
    } | null;
    void writeAudit({
      actor: "Razorpay",
      action: "REFUND_PROCESSED",
      entity: "Refund",
      entityId: notifyData.refundId,
      riderId: notifyData.riderId,
      bookingId: notifyData.bookingId,
      detail: `₹${notifyData.amount} · ${notifyData.gatewayTxnId}`,
    });
    await notifyRefundReceipt({
      refundId: notifyData.refundId,
      bookingId: notifyData.bookingId,
      riderName: String(rider?.fullName || booking?.userName || ""),
      riderPhone: String(rider?.phone || booking?.userPhone || "").replace(/\D/g, "").slice(-10),
      riderEmail: String(rider?.email || booking?.userEmail || ""),
      amount: notifyData.amount,
      paymentGateway: "Razorpay",
      gatewayTxnId: notifyData.gatewayTxnId,
      razorpayRefundId: notifyData.razorpayRefundId,
      isSecurityDeposit: notifyData.deposit,
    });
  }

  return { found: true, status: resultingStatus };
}
