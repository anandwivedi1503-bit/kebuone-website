import { denyStaffDeletes, isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Transaction from "@/models/Transaction";
import Rider from "@/models/Rider";
import mongoose from "mongoose";
import { money } from "@/lib/gst";
import { listBookingRazorpayPaymentIds } from "@/lib/razorpay/bookingRazorpayCaptures";
import { refundRazorpayAmountForBooking } from "@/lib/razorpay/refundRazorpayPayment";
import { appendBoundedText } from "@/lib/listQuery";
import { writeAudit } from "@/lib/writeAudit";
import { denyIfBookingOutOfHub } from "@/lib/staffHubScope";
import { releaseSecurityDepositHoldOnce } from "@/lib/securityDepositHold";

const idRegex = /^[A-Za-z0-9_-]{3,100}$/;

const refundStatuses = [
  "PROCESSING",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "FAILED",
];

const allowedUpdateFields = [
  "amount",
  "gatewayTxnId",
  "refundStatus",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000;
}

function normalizeStatus(value: unknown) {
  return clean(value).toUpperCase();
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  let session: mongoose.ClientSession | null = null;

  try {

    const gate = await requireAdminDashboards(...API_DASHBOARDS.refunds);
    if (gate.error) return gate.error;

    await connectDB();

    session = await mongoose.startSession();

    session.startTransaction();

    const { id } = await params;

    const earlyRefund = (await Refund.findById(id)
      .select("bookingId")
      .lean()) as { bookingId?: string } | null;
    if (earlyRefund) {
      const hubBlock = await denyIfBookingOutOfHub(
        gate.session,
        String(earlyRefund.bookingId || "")
      );
      if (hubBlock) {
        await session.abortTransaction();
        session.endSession();
        return hubBlock;
      }
    }

    const body = await req.json();
    let refundChannel = "Wallet";
    let refundMessage = "";

    const updateData: Record<string, unknown> = {};

    const errors: string[] = [];

  for (const field of allowedUpdateFields) {
  if (body[field] !== undefined) {
    updateData[field] = body[field];
  }
}

if (Object.keys(updateData).length === 0) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: [
        "No valid refund update fields received.",
      ],
    },
    {
      status: 400,
    }
  );

}

if (updateData.amount !== undefined) {

  if (!isValidAmount(updateData.amount)) {
    errors.push(
      "Refund amount must be greater than zero."
    );
  }

  updateData.amount =
    Number(updateData.amount);

}

if (updateData.gatewayTxnId !== undefined) {

  const gatewayTxnId =
    clean(updateData.gatewayTxnId);

  if (
    gatewayTxnId &&
    !idRegex.test(gatewayTxnId)
  ) {
    errors.push(
      "Gateway transaction ID is invalid."
    );
  }

  updateData.gatewayTxnId =
    gatewayTxnId;

}

if (updateData.refundStatus !== undefined) {

  const refundStatus =
    normalizeStatus(updateData.refundStatus);

  if (
    !refundStatuses.includes(refundStatus)
  ) {
    errors.push(
      "Invalid refund status."
    );
  }

  updateData.refundStatus =
    refundStatus;

  if (refundStatus === "REFUNDED") {

    updateData.processedAt =
      new Date();

    updateData.processedBy =
      "Admin";

  }

}

if (errors.length > 0) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors,
    },
    {
      status: 400,
    }
  );

}

    if (updateData.refundStatus === "REFUNDED") {

  const refund = await Refund.findById(id).session(session);

if (!refund) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: ["Refund not found."],
    },
    {
      status: 404,
    }
  );

}

if (refund.refundStatus === "REFUNDED") {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message:
        "This refund has already been processed.",
    },
    {
      status: 400,
    }
  );

 }

const booking = await Booking.findOne({
  bookingId: refund.bookingId,
}).session(session);

if (!booking) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "Booking not found.",
    },
    {
      status: 404,
    }
  );

}

const refundSource = String(refund.refundSource || "");
const isDepositRefund =
  refundSource === "Security Deposit" ||
  /security deposit/i.test(String(refund.remarks || ""));

const priorRefunded = money(
  (
    await Refund.find({
      bookingId: refund.bookingId,
      refundStatus: "REFUNDED",
      _id: { $ne: refund._id },
    }).session(session)
  ).reduce((sum, row) => sum + Number(row.amount || 0), 0)
);

const refundCap = isDepositRefund
  ? money(booking.securityDeposit)
  : money(Number(booking.receivedAmount || 0) - priorRefunded);

if (Number(refund.amount) > refundCap + 0.009) {
  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: isDepositRefund
        ? "Refund amount exceeds security deposit."
        : "Refund amount exceeds the amount received on this booking.",
    },
    {
      status: 400,
    }
  );
}

const rider = await Rider.findOne({
  riderId: booking.riderId,
}).session(session);

if (!rider) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "Rider not found.",
    },
    {
      status: 404,
    }
  );

}

let sendToRazorpay = body.sendToRazorpay !== false;
const paymentId = String(booking.razorpayPaymentId || "");
let gatewayId = String(refund.razorpayRefundId || "").trim();
const captureIds = await listBookingRazorpayPaymentIds(
  String(refund.bookingId),
  paymentId
);
let walletFallbackReason = "";

if (sendToRazorpay && !gatewayId && captureIds.length === 0) {
  sendToRazorpay = false;
  walletFallbackReason =
    "No Razorpay capture (pay_ id) on this booking — credited the rider wallet.";
  updateData.paymentGateway = "Wallet";
}
refundChannel = sendToRazorpay ? "Razorpay" : "Wallet";
refundMessage = sendToRazorpay
  ? "Refund sent via Razorpay to the original payment."
  : walletFallbackReason || "Refund credited to the rider wallet.";

if (sendToRazorpay) {

  await session.abortTransaction();
  session.endSession();
  session = null;

  if (!gatewayId) {
    const claimed = await Refund.findOneAndUpdate(
      {
        _id: refund._id,
        refundStatus: { $in: ["PENDING", "APPROVED", "PROCESSING"] },
      },
      { $set: { refundStatus: "PROCESSING" } },
      { new: true }
    );
    if (!claimed) {
      const live = await Refund.findById(id);
      gatewayId = String(live?.razorpayRefundId || "").trim();
      if (!gatewayId) {
        return NextResponse.json(
          {
            success: false,
            message:
              live?.refundStatus === "REFUNDED"
                ? "This refund has already been processed."
                : "This refund is already being sent to Razorpay.",
          },
          { status: live?.refundStatus === "REFUNDED" ? 400 : 409 }
        );
      }
    }
  }

  try {
    if (!gatewayId) {
      const razorpayRefund = await refundRazorpayAmountForBooking(
        String(refund.bookingId),
        Number(refund.amount),
        paymentId
      );
      if (razorpayRefund.refunded <= 0.009) {
        throw new Error("No Razorpay payment left to refund.");
      }
      gatewayId = razorpayRefund.ids[0] || razorpayRefund.lastPaymentId;
      updateData.razorpayRefundId = gatewayId;
      updateData.gatewayTxnId = (razorpayRefund.ids.join(",") || gatewayId).slice(0, 100);
      updateData.paymentGateway = "Razorpay";
      await Refund.updateOne(
        { _id: id },
        {
          $set: {
            razorpayRefundId: gatewayId,
            gatewayTxnId: updateData.gatewayTxnId,
            paymentGateway: "Razorpay",
            refundStatus: "PROCESSING",
          },
        }
      );
    } else {
      updateData.razorpayRefundId = gatewayId;
      updateData.gatewayTxnId = gatewayId;
      updateData.paymentGateway = "Razorpay";
    }
  } catch (error) {
    console.error("RAZORPAY REFUND ERROR:", error);
    const detail = error instanceof Error ? error.message : String(error || "Razorpay refund failed");
    await Refund.updateOne(
      { _id: id, refundStatus: { $in: ["PROCESSING", "PENDING", "APPROVED"] } },
      {
        $set: {
          refundStatus: "APPROVED",
          failureReason: detail.slice(0, 400),
        },
      }
    );
    return NextResponse.json(
      {
        success: false,
        message: `Razorpay could not refund this payment (${detail}). Status is Approved — retry Razorpay, or credit wallet only if this was cash/offline.`,
      },
      { status: 502 }
    );
  }

  session = await mongoose.startSession();
  session.startTransaction();

  const liveRefund = await Refund.findById(id).session(session);
  const liveBooking = await Booking.findOne({
    bookingId: refund.bookingId,
  }).session(session);

  if (!liveRefund || !liveBooking) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { success: false, message: "Refund or booking not found after gateway refund." },
      { status: 404 }
    );
  }

  if (liveRefund.refundStatus === "REFUNDED") {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { success: false, message: "This refund has already been processed." },
      { status: 400 }
    );
  }

  liveBooking.refundAmount = money(
    Number(liveBooking.refundAmount || 0) + Number(liveRefund.amount)
  );
  if (isDepositRefund) {
    liveBooking.securityDepositRefunded = true;
  }
  liveBooking.remarks = appendBoundedText(
    liveBooking.remarks,
    `Refund Completed via Razorpay\nRefund ID : ${liveRefund.refundId}\nAmount : ₹${liveRefund.amount}`
  );
  await liveBooking.save({ session });

  if (isDepositRefund) {
    await Rider.findOneAndUpdate(
      { riderId: liveBooking.riderId },
      { securityDeposit: 0 },
      { session }
    );
  }

  const razorpayWallet = await Wallet.findOne({
    riderId: liveBooking.riderId,
  }).session(session);
  if (razorpayWallet) {
    await releaseSecurityDepositHoldOnce(
      liveBooking,
      session,
      "Hold released with Razorpay deposit refund"
    );
  }

  const existingRefundTransaction = await Transaction.findOne({
    transactionId: `RF-${liveRefund.refundId}`,
  }).session(session);

  if (!existingRefundTransaction) {
    const invoiceNumber = `INV-RF-${liveRefund.refundId}`;
    await Transaction.create(
      [
        {
          transactionId: `RF-${liveRefund.refundId}`,
          bookingId: liveBooking.bookingId,
          userId: String(liveBooking.userId),
          userName: liveBooking.userName,
          amount: liveRefund.amount,
          paymentMethod: "Razorpay",
          transactionType: "Refund",
          status: "Success",
          refundStatus: "Completed",
          invoiceNumber,
          invoiceGenerated: true,
          razorpayPaymentId: gatewayId?.startsWith("pay_") ? gatewayId : "",
          remarks: `Razorpay refund ${gatewayId || ""}`.trim(),
          transactionSource: "Admin Panel",
        },
      ],
      { session }
    );
  }
} else {

booking.refundAmount = money(
  Number(booking.refundAmount || 0) + Number(refund.amount)
);

if (isDepositRefund) {
  booking.securityDepositRefunded = true;
}

booking.remarks = appendBoundedText(
  booking.remarks,
  `${walletFallbackReason || "Refund Completed"}\nRefund ID : ${refund.refundId}\nAmount : ₹${refund.amount}`
);

await booking.save({
  session,
});

if (isDepositRefund) {
  await Rider.findOneAndUpdate(
    {
      riderId: booking.riderId,
    },
    {
      securityDeposit: 0,
    },
    {
      session,
    }
  );
}

await releaseSecurityDepositHoldOnce(
  booking,
  session,
  "Hold released with wallet deposit refund"
);

let wallet = await Wallet.findOne({
  riderId: booking.riderId,
}).session(session);

if (!wallet) {
  const phone = String(rider.phone || booking.userPhone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      {
        success: false,
        message: "Cannot create a wallet for this rider because the phone number is missing.",
      },
      { status: 400 }
    );
  }
  try {
    const [created] = await Wallet.create(
      [
        {
          riderId: String(booking.riderId || ""),
          userId: rider._id,
          userName: String(rider.fullName || booking.userName || ""),
          phone,
          balance: 0,
          securityDepositHold: 0,
          freezeAmount: 0,
          totalRecharge: 0,
          totalSpent: 0,
          totalRefund: 0,
          status: "Active",
          adminBlocked: false,
          isDeleted: false,
          updatedBy: "Refund",
        },
      ],
      { session }
    );
    wallet = created;
  } catch {
    wallet = await Wallet.findOne({
      riderId: booking.riderId,
    }).session(session);
  }
}

if (!wallet) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "Could not create a rider wallet for this refund. Try again.",
    },
    {
      status: 500,
    }
  );

}

const existingWalletRefund =
  await WalletTransaction.findOne({
    transactionId: `WR-${refund.refundId}`,
  }).session(session);

if (!existingWalletRefund) {
  wallet.balance += Number(refund.amount);
  wallet.totalRefund += Number(refund.amount);
  await wallet.save({
    session,
  });

  await WalletTransaction.create(
    [
      {
        transactionId: `WR-${refund.refundId}`,

        riderId: booking.riderId,

        userId: booking.userId,

        userName: booking.userName,

        amount: refund.amount,

        transactionType: "Refund",

        paymentMethod: "Wallet",

        bookingId: booking.bookingId,

        balanceAfter: wallet.balance,

        remarks: isDepositRefund
          ? "Security Deposit Refunded"
          : "Booking cancellation refund",

        status: "Success",
      },
    ],
    {
      session,
    }
  );
}

const existingRefundTransaction =
  await Transaction.findOne({
    transactionId: `RF-${refund.refundId}`,
  }).session(session);

if (!existingRefundTransaction) {
  const invoiceNumber = `INV-RF-${refund.refundId}`;
  await Transaction.create(
    [
      {
        transactionId: `RF-${refund.refundId}`,
        bookingId: booking.bookingId,
        userId: String(booking.userId),
        userName: booking.userName,
        amount: refund.amount,
        paymentMethod: "Wallet",
        transactionType: "Refund",
        status: "Success",
        refundStatus: "Completed",
        invoiceNumber,
        invoiceGenerated: true,
        remarks: walletFallbackReason || "Wallet refund",
        transactionSource: "Admin Panel",
      },
    ],
    { session }
  );
}
}

    }

    const updatedRefund =
  await Refund.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
      session,
    }
  );

if (!updatedRefund) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: ["Refund not found."],
    },
    {
      status: 404,
    }
  );

}

await session.commitTransaction();
session.endSession();

void writeAudit({
  actor: "Admin",
  action: String(updateData.refundStatus || "REFUND_UPDATED"),
  entity: "Refund",
  entityId: String(updatedRefund.refundId || id),
  riderId: String(updatedRefund.riderId || ""),
  bookingId: String(updatedRefund.bookingId || ""),
  detail: refundMessage || refundChannel,
});

return NextResponse.json({
  success: true,
  data: updatedRefund,
  channel: refundChannel,
  message: refundMessage || undefined,
});

} catch (error) {

  if (session) {
    try {
      await session.abortTransaction();
    } catch {}

    session.endSession();
  }

  return NextResponse.json(
    {
      success: false,
      error: String(error),
    },
    {
      status: 500,
    }
  );

}
    }

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const gate = await requireAdminDashboards(...API_DASHBOARDS.refunds);
    if (gate.error) return gate.error;
    const blockedDelete = await denyStaffDeletes();
    if (blockedDelete) return blockedDelete;

    await connectDB();

    const { id } = await params;

const refund = await Refund.findById(id);
if (refund?.refundStatus === "REJECTED") {
  return NextResponse.json(
    {
      success: false,
      message:
        "Rejected refunds cannot be approved.",
    },
    { status: 400 }
  );
}

if (!refund) {
  return NextResponse.json(
    {
      success: false,
      message: "Refund not found.",
    },
    { status: 404 }
  );
}

if (refund.refundStatus === "REFUNDED") {
  return NextResponse.json(
    {
      success: false,
      message: "Completed refunds cannot be deleted.",
    },
    { status: 400 }
  );
}

await Refund.findByIdAndDelete(id);

return NextResponse.json({
  success: true,
  message: "Refund deleted successfully",
});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}