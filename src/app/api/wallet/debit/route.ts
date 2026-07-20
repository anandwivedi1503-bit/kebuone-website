import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { walletId, amount, remarks } = await req.json();

    const debitAmount = Number(amount);

    if (
  !walletId ||
  debitAmount < 1 ||
  debitAmount > 50000
) {
  return NextResponse.json(
    {
      success: false,
      message: "Amount must be between ₹1 and ₹50,000.",
    },
    { status: 400 }
  );
}

    const wallet = await Wallet.findById(walletId);

if (!wallet) {
  return NextResponse.json(
    {
      success: false,
      message: "Wallet not found.",
    },
    { status: 404 }
  );
}

if (wallet.status === "Blocked") {
  return NextResponse.json(
    {
      success: false,
      message: "This wallet is blocked. Debit is not allowed.",
    },
    { status: 403 }
  );
}

    if (wallet.balance < debitAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient wallet balance.",
        },
        { status: 400 }
      );
    }

     wallet.balance -= debitAmount;
wallet.totalSpent += debitAmount;

    await wallet.save();

    const transactionId =
  "WTX-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

   await WalletTransaction.create({

  transactionId,

  riderId: wallet.riderId,

  userId: wallet.userId,

  userName: wallet.userName,

  amount: debitAmount,

  transactionType: "Admin Debit",

  paymentMethod: "Wallet",

  bookingId: "",

  razorpayPaymentId: "",

  razorpayOrderId: "",

  balanceAfter: wallet.balance,

  remarks,

  status: "Success",

});
    return NextResponse.json({
      success: true,
      data: wallet,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Debit failed.",
      },
      { status: 500 }
    );
  }
}