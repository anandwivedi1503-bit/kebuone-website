import { denyStaffDeletes, isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { denyIfBookingOutOfHub, denyIfRiderOutOfHub } from "@/lib/staffHubScope";

const paymentMethods = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Razorpay",
  "Razorpay Payment Link",
];

const transactionTypes = [
  "Ride Payment",
  "Booking Payment",
  "Booking Payment - Pending Verification",
  "Security Deposit",
  "Wallet Recharge",
  "Refund",
  "Penalty",
  "Extension Payment",
  "Security Deposit Refund",
];

const statuses = [
  "Pending",
  "Success",
  "Pending Verification",
  "Failed",
  "Refunded",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
    if (gate.error) return gate.error;

    await connectDB();

    const { id } = await params;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    const bookingBlock = await denyIfBookingOutOfHub(
      gate.session,
      String(transaction.bookingId || "")
    );
    if (bookingBlock) return bookingBlock;
    if (!String(transaction.bookingId || "").trim()) {
      const riderId = String(
        (transaction as { riderId?: string }).riderId || ""
      );
      if (riderId) {
        const riderBlock = await denyIfRiderOutOfHub(gate.session, riderId);
        if (riderBlock) return riderBlock;
      }
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });

  } catch (error) {

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
    if (gate.error) return gate.error;

    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const transaction = await Transaction.findById(id);

    if (!transaction) {

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        {
          status: 404,
        }
      );

    }

    const bookingBlock = await denyIfBookingOutOfHub(
      gate.session,
      String(transaction.bookingId || "")
    );
    if (bookingBlock) return bookingBlock;

    if (
      body.amount !== undefined &&
      !isValidAmount(body.amount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.paymentMethod &&
      !paymentMethods.includes(clean(body.paymentMethod))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.transactionType &&
      !transactionTypes.includes(clean(body.transactionType))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid transaction type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.status &&
      !statuses.includes(clean(body.status))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.status) {
  transaction.status = clean(body.status);
}

if (body.refundStatus) {
  transaction.refundStatus = clean(body.refundStatus);
}

if (body.refundAmount !== undefined) {
  transaction.refundAmount = Number(body.refundAmount);
}

if (body.refundReason !== undefined) {
  transaction.refundReason = clean(body.refundReason);
}

if (body.refundDate) {
  transaction.refundDate = new Date(body.refundDate);
}

if (body.invoiceGenerated !== undefined) {
  transaction.invoiceGenerated =
    Boolean(body.invoiceGenerated);
}

if (body.invoiceNumber !== undefined) {
  transaction.invoiceNumber =
    clean(body.invoiceNumber);
}

if (body.remarks !== undefined) {
  transaction.remarks =
    clean(body.remarks);
}

await transaction.save();

    return NextResponse.json({
      success: true,
      data: transaction,
    });

  } catch (error) {

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

    const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
    if (gate.error) return gate.error;
    const blockedDelete = await denyStaffDeletes();
    if (blockedDelete) return blockedDelete;


    await connectDB();

    const { id } = await params;

    const transaction =
      await Transaction.findById(id);

    if (!transaction) {

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        {
          status: 404,
        }
      );

    }

    return NextResponse.json(
  {
    success: false,
    message:
      "Transactions cannot be deleted. Financial records are permanent.",
  },
  {
    status: 403,
  }
);

  } catch (error) {

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
