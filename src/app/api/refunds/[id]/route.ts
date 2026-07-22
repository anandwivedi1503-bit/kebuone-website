import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Transaction from "@/models/Transaction";
import Rider from "@/models/Rider";

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

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
      return NextResponse.json(
        {
          success: false,
          errors: ["No valid refund update fields received."],
        },
        { status: 400 }
      );
    }

    if (updateData.amount !== undefined) {
      if (!isValidAmount(updateData.amount)) {
        errors.push("Refund amount must be greater than zero.");
      }

      updateData.amount = Number(updateData.amount);
    }

    if (updateData.gatewayTxnId !== undefined) {
      const gatewayTxnId = clean(updateData.gatewayTxnId);

      if (gatewayTxnId && !idRegex.test(gatewayTxnId)) {
        errors.push("Gateway transaction ID is invalid.");
      }

      updateData.gatewayTxnId = gatewayTxnId;
    }

    if (updateData.refundStatus !== undefined) {
      const refundStatus = normalizeStatus(updateData.refundStatus);

      if (!refundStatuses.includes(refundStatus)) {
        errors.push("Invalid refund status.");
      }

      updateData.refundStatus = refundStatus;
      if (refundStatus === "REFUNDED") {

    updateData.processedAt = new Date();

    updateData.processedBy = "Admin";

}
    }

    if (updateData.refundStatus === "REFUNDED") {

  const refund = await Refund.findById(id);

if (!refund) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Refund not found."],
    },
    { status: 404 }
  );
}

if (refund.refundStatus === "REFUNDED") {
  return NextResponse.json(
    {
      success: false,
      message: "This refund has already been processed.",
    },
    { status: 400 }
  );
}

{

    const booking = await Booking.findOne({
  bookingId: refund.bookingId,
});

    if (booking) {

      booking.refundAmount = Number(refund.amount);

      booking.securityDepositRefunded = true;

      booking.remarks = `${booking.remarks || ""}

Refund Completed

Refund ID : ${refund.refundId}

Amount : ₹${refund.amount}

Date : ${new Date().toLocaleString("en-IN")}

`;

      await booking.save();

      await Rider.findOneAndUpdate(
  {
    riderId: booking.riderId,
  },
  {
    securityDeposit: 0,
  }
);

      const wallet = await Wallet.findOne({
        riderId: booking.riderId,
      });

      if (wallet) {

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

        await wallet.save();

        await WalletTransaction.create({

          transactionId:
            "WR-" +
            Date.now(),

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

        });

      }

      await Transaction.create({

        transactionId:
          "RF-" +
          Date.now(),

        bookingId: booking.bookingId,

        userId: String(booking.userId),

        userName: booking.userName,

        amount: refund.amount,

        paymentMethod: "Wallet",

        transactionType: "Refund",

        status: "Success",

        refundStatus: "Completed",

      });

    }

  }

}

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    const refund = await Refund.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!refund) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Refund not found."],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: refund,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const { id } = await params;

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