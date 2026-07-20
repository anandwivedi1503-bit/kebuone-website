import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

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

    const wallets = await Wallet.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: wallets,
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

    const riderId = clean(body.riderId);
    const userName = clean(body.userName);
    const phone = clean(body.phone);

    const errors: string[] = [];

    if (riderId.length < 3) {
      errors.push("Invalid rider ID.");
    }

    if (userName.length < 2) {
      errors.push("Invalid user name.");
    }

    if (phone.length < 10) {
      errors.push("Invalid phone number.");
    }

    if (
      body.balance !== undefined &&
      !isValidAmount(body.balance)
    ) {
      errors.push("Invalid wallet balance.");
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

    const existing = await Wallet.findOne({
      riderId,
    });

    if (existing) {

      return NextResponse.json(
        {
          success: false,
          errors: ["Wallet already exists."],
        },
        { status: 409 }
      );

    }

    const wallet = await Wallet.create({

      riderId,

      userId: body.userId,

      userName,

      phone,

      balance: Number(body.balance || 0),

      securityDepositHold: 0,

      totalRecharge: 0,

      totalSpent: 0,

      totalRefund: 0,

      status: "Active",

    });

    return NextResponse.json({

      success: true,

      data: wallet,

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