import { NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { getOpsMoneySummary } from "@/lib/opsMoneySummary";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();
    const data = await getOpsMoneySummary();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("OPS MONEY SUMMARY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load money summary." },
      { status: 500 }
    );
  }
}
