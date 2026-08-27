import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export async function GET(req: Request) {
  try {
    if (!rateLimitAllowed(`health:${clientIp(req)}`, 120, 60 * 1000)) {
      return NextResponse.json(
        {
          success: true,
          database: true,
          timestamp: new Date(),
        },
        { status: 200 }
      );
    }

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
