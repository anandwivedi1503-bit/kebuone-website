import { denyStaffDeletes, isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Transaction from "@/models/Transaction";
import Rider from "@/models/Rider";
import mongoose from "mongoose";
import { refundRazorpayPayment } from "@/lib/razorpay/refundRazorpayPayment";
import { appendBoundedText } from "@/lib/listQuery";
import { uniqueMoneyId } from "@/lib/ids";
import { writeAudit } from "@/lib/writeAudit";

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

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    session = await mongoose.startSession();

    session.startTransaction();

    const { id } = await params;

    const body = await req.json();

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

if (
  Number(refund.amount) >
  Number(booking.securityDeposit || 0)
) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message:
        "Refund amount exceeds security deposit.",
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

const sendToRazorpay = body.sendToRazorpay === true;

if (sendToRazorpay) {
  const paymentId = String(booking.razorpayPaymentId || "");

  await session.abortTransaction();
  session.endSession();
  session = null;

  if (!paymentId) {
    return NextResponse.json(
      {
        success: false,
        message: "This booking has no Razorpay payment. Use the wallet refund.",
      },
      { status: 400 }
    );
  }

  try {
    const razorpayRefund = await refundRazorpayPayment(
      paymentId,
      Number(refund.amount)
    );
    updateData.razorpayRefundId = String(
      (razorpayRefund as { id?: string }).id || ""
    );
    updateData.gatewayTxnId = String(
      (razorpayRefund as { id?: string }).id || paymentId
    );
    updateData.paymentGateway = "Razorpay";
  } catch (error) {
    console.error("RAZORPAY REFUND ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Razorpay refund failed. Wallet was not credited.",
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

  liveBooking.refundAmount = Number(liveRefund.amount);
  liveBooking.securityDepositRefunded = true;
  liveBooking.remarks = appendBoundedText(
    liveBooking.remarks,
    `Refund Completed via Razorpay\nRefund ID : ${liveRefund.refundId}\nAmount : ₹${liveRefund.amount}`
  );
  await liveBooking.save({ session });

  await Rider.findOneAndUpdate(
    { riderId: liveBooking.riderId },
    { securityDeposit: 0 },
    { session }
  );

  const existingRefundTransaction = await Transaction.findOne({
    bookingId: liveBooking.bookingId,
    transactionType: "Refund",
  }).session(session);

  if (!existingRefundTransaction) {
    await Transaction.create(
      [
        {
          transactionId: uniqueMoneyId("RF"),
          bookingId: liveBooking.bookingId,
          userId: String(liveBooking.userId),
          userName: liveBooking.userName,
          amount: liveRefund.amount,
          paymentMethod: "Razorpay",
          transactionType: "Refund",
          status: "Success",
          refundStatus: "Completed",
        },
      ],
      { session }
    );
  }
} else {

booking.refundAmount = Number(refund.amount);

booking.securityDepositRefunded = true;

booking.remarks = appendBoundedText(
  booking.remarks,
  `Refund Completed\nRefund ID : ${refund.refundId}\nAmount : ₹${refund.amount}`
);

await booking.save({
  session,
});

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

const wallet = await Wallet.findOne({
  riderId: booking.riderId,
}).session(session);

if (!wallet) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "Wallet not found.",
    },
    {
      status: 404,
    }
  );

}

      wallet.balance += Number(refund.amount);

wallet.totalRefund += Number(refund.amount);

wallet.totalSpent = Math.max(
  0,
  wallet.totalSpent - Number(refund.amount)
);

wallet.securityDepositHold = Math.max(
  0,
  wallet.securityDepositHold - Number(refund.amount)
);

await wallet.save({
  session,
});

const existingWalletRefund =
  await WalletTransaction.findOne({
    bookingId: booking.bookingId,
    transactionType: "Refund",
  }).session(session);

if (!existingWalletRefund) {

  await WalletTransaction.create(
    [
      {
        transactionId: uniqueMoneyId("WR"),

        riderId: booking.riderId,

        userId: booking.userId,

        userName: booking.userName,

        amount: refund.amount,

        transactionType: "Refund",

        paymentMethod: "Wallet",

        bookingId: booking.bookingId,

        balanceAfter: wallet.balance,

        remarks: "Security Deposit Refunded",

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
    bookingId: booking.bookingId,
    transactionType: "Refund",
  }).session(session);

if (!existingRefundTransaction) {

  await Transaction.create(
    [
      {
        transactionId: uniqueMoneyId("RF"),

        bookingId: booking.bookingId,

        userId: String(booking.userId),

        userName: booking.userName,

        amount: refund.amount,

        paymentMethod: "Wallet",

        transactionType: "Refund",

        status: "Success",

        refundStatus: "Completed",
      },
    ],
    {
      session,
    }
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
  detail: body.sendToRazorpay === true ? "Razorpay" : "Wallet",
});

return NextResponse.json({
  success: true,
  data: updatedRefund,
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
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
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