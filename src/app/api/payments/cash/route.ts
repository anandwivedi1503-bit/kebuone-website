import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { applyStaffBookingPayment } from "@/lib/applyStaffBookingPayment";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import {
  hubForbiddenResponse,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return unauthorizedResponse();
    }
    const gate = await requireAdminDashboards(...API_DASHBOARDS.cashCollect);
    if (gate.error) return gate.error;

    await connectDB();
    const body = await req.json();
    const bookingId = String(body.bookingId || "").trim().toUpperCase();
    const booking = (await Booking.findOne({ bookingId })
      .select("currentHub startHub")
      .lean()) as { currentHub?: unknown; startHub?: unknown } | null;
    if (booking && !staffCanAccessBooking(session, booking)) {
      return hubForbiddenResponse();
    }
    const result = await applyStaffBookingPayment({
      bookingId,
      paidAmount: Number(body.amount ?? body.paidAmount),
      collectedBy: session.username,
      notes: String(body.notes || ""),
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error) {
    console.error("CASH COLLECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to record cash." },
      { status: 500 }
    );
  }
}
