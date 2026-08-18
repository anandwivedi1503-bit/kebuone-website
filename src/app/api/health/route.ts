import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

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