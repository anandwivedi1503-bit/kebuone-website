import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Booking from "@/models/Booking";
import { applyOpsListFilters, listResponse, parseListQuery } from "@/lib/listQuery";
import { idInScopeFilter, scopedBookingIds } from "@/lib/staffHubScope";

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

export async function GET(req: Request) {
  try {
        const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
    if (gate.error) return gate.error;
    await connectDB();

    const parsed = parseListQuery(req);
    const { page, limit, skip, q } = parsed;
    const filter: Record<string, unknown> = {
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    };
    applyOpsListFilters(filter, parsed);
    const bookingIds = await scopedBookingIds(gate.session);
    Object.assign(filter, idInScopeFilter("bookingId", bookingIds));
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const and = (filter.$and as unknown[]) || [];
      if (filter.$or) and.unshift({ $or: filter.$or });
      and.push({
          $or: [
            { transactionId: new RegExp(escaped, "i") },
            { bookingId: new RegExp(escaped, "i") },
            { userName: new RegExp(escaped, "i") },
          ],
      });
      filter.$and = and;
      delete filter.$or;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    return NextResponse.json(listResponse(transactions, total, page, limit));
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
    const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
    if (gate.error) return gate.error;
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

    if (
  body.remarks &&
  String(body.remarks).trim().length > 500
) {
  errors.push(
    "Remarks cannot exceed 500 characters."
  );
}

if (
  body.refundAmount !== undefined &&
  !isValidAmount(body.refundAmount)
) {
  errors.push(
    "Invalid refund amount."
  );
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

    const booking = await Booking.findOne({
  bookingId,
});

if (!booking) {

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Booking not found.",
      ],
    },
    {
      status: 404,
    }
  );

}

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
      cgstAmount: Number(
        body.cgstAmount ?? Number(body.gstAmount || 0) / 2
      ),
      sgstAmount: Number(
        body.sgstAmount ?? Number(body.gstAmount || 0) / 2
      ),
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