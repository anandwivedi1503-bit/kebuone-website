import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

const idRegex = /^[A-Za-z0-9_-]{3,100}$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;

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
];

const statuses = [
  "Success",
  "Pending",
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

export async function GET() {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const transactions = await Transaction.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: transactions,
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

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const body = await req.json();

    const transactionId = clean(body.transactionId);
    const bookingId = clean(body.bookingId);
    const userId = clean(body.userId);
    const userName = clean(body.userName);
    const paymentMethod = clean(body.paymentMethod);
    const transactionType = clean(body.transactionType);
    const status = clean(body.status);

    const errors: string[] = [];

    if (!idRegex.test(transactionId)) {
      errors.push("Valid transaction ID is required.");
    }

    if (!idRegex.test(bookingId)) {
      errors.push("Valid booking ID is required.");
    }

    if (!userId || userId.length < 3) {
      errors.push("Valid user ID or phone number is required.");
    }

    if (!nameRegex.test(userName)) {
      errors.push("Valid user name is required.");
    }

    if (!isValidAmount(body.amount) || Number(body.amount) <= 0) {
      errors.push("Transaction amount must be greater than zero.");
    }

    if (body.gstAmount !== undefined && !isValidAmount(body.gstAmount)) {
      errors.push("GST amount must be valid.");
    }

    if (!paymentMethods.includes(paymentMethod)) {
      errors.push("Valid payment method is required.");
    }

    if (!transactionTypes.includes(transactionType)) {
      errors.push("Valid transaction type is required.");
    }

    if (!statuses.includes(status)) {
      errors.push("Valid transaction status is required.");
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

    const existingTransaction = await Transaction.findOne({
      transactionId,
    });

    if (body.razorpayPaymentId) {

const existingPayment =
await Transaction.findOne({
razorpayPaymentId: body.razorpayPaymentId,
});

if(existingPayment){

return NextResponse.json(
{
success:false,
errors:["This Razorpay payment already exists."]
},
{status:409}
);

}

}

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Transaction ID already exists."],
        },
        { status: 409 }
      );
    }

    const transaction = await Transaction.create({
      ...body,
      transactionId,
      bookingId,
      userId,
      userName,
      amount: Number(body.amount),
      gstAmount: Number(body.gstAmount || 0),
      paymentMethod,
      transactionType,
      status,
    });

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
      { status: 500 }
    );
  }
}