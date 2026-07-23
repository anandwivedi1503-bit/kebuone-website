import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      database: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      timestamp: new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        database: false,
        readyState: mongoose.connection.readyState,
        error: String(error),
      },
      { status: 500 }
    );
  }
}