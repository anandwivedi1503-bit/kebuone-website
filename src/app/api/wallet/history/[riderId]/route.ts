import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WalletTransaction from "@/models/WalletTransaction";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ riderId: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { riderId } = await params;

    const history = await WalletTransaction.find({
      riderId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wallet history.",
      },
      { status: 500 }
    );
  }
}