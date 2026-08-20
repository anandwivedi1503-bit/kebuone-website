import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { maybeSweepUnpaidBookings } from "@/lib/jobs/releaseUnpaidBookings";

export async function GET() {
  try {
    await connectDB();
    void maybeSweepUnpaidBookings();

    return NextResponse.json({
      success: true,
      database: mongoose.connection.readyState === 1,
      timestamp: new Date(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        database: false,
      },
      { status: 500 }
    );
  }
}