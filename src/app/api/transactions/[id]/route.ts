import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

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

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

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

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

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

    Object.assign(transaction, body);

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

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

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

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully.",
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