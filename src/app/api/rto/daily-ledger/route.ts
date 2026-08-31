import { NextResponse } from "next/server";

import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { openDueRtoDays } from "@/lib/jobs/releaseUnpaidBookings";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";

export async function GET() {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
    if (gate.error) return gate.error;
    await connectDB();
    await openDueRtoDays(120);

    const contracts = await Booking.find({
      $and: [NOT_DELETED_FILTER, { rentalMode: "Rent To Own" }],
    })
      .sort({ updatedAt: -1 })
      .limit(300)
      .select(
        "bookingId riderId userName userPhone vehicleId pendingAmount receivedAmount rtoInstallmentsPaid remainingRentToOwnDays rtoNextInstallmentAt ownershipTransferred rideStatus paymentStatus"
      )
      .lean();

    const ids = contracts.map((row) => row.bookingId).filter(Boolean);
    const receipts = await Transaction.find({
      bookingId: { $in: ids },
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .limit(400)
      .select(
        "transactionId bookingId userName amount gstAmount paymentMethod invoiceNumber remarks createdAt status"
      )
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        contracts,
        receipts,
      },
    });
  } catch (error) {
    console.error("RTO LEDGER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load Rent to Own ledger." },
      { status: 500 }
    );
  }
}
