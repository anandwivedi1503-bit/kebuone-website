import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { readJobHeartbeat } from "@/lib/jobHeartbeat";

export async function GET(req: Request) {
  try {
    if (!(await rateLimitAllowed(`health:${clientIp(req)}`, 120, 60 * 1000))) {
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
    const unpaidJob = await readJobHeartbeat("unpaidSweep").catch(() => null);

    return NextResponse.json({
      success: true,
      database: mongoose.connection.readyState === 1,
      timestamp: new Date(),
      unpaidJob,
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
