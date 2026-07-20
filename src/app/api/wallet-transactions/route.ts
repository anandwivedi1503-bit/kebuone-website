import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const transactions = await WalletTransaction.find().sort({
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