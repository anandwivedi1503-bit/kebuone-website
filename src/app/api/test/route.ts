import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super") {
      return unauthorizedResponse();
    }

    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
      },
      { status: 500 }
    );
  }
}