import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BatterySwap from "@/models/BatterySwap";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const swaps = await BatterySwap.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: swaps,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
    });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const body = await req.json();

    const swap = await BatterySwap.create(body);

    return NextResponse.json({
      success: true,
      data: swap,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
    });
  }
}