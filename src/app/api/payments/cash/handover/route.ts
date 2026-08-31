import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { writeAudit } from "@/lib/writeAudit";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return unauthorizedResponse();
    }
    const gate = await requireAdminDashboards(...API_DASHBOARDS.cashHandover);
    if (gate.error) return gate.error;

    await connectDB();
    const body = await req.json();
    const transactionId = String(body.transactionId || "").trim();
    const notes = String(body.notes || "").trim().slice(0, 500);

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required." },
        { status: 400 }
      );
    }

    const txn = await Transaction.findOneAndUpdate(
      {
        transactionId,
        paymentMethod: "Cash",
        status: "Success",
        $or: [
          { cashHandoverStatus: "DueToCompany" },
          { cashHandoverStatus: { $exists: false } },
          { cashHandoverStatus: "None" },
        ],
      },
      {
        $set: {
          cashHandoverStatus: "HandedOver",
          handedOverAt: new Date(),
          handedOverBy: session.username,
          handoverNotes: notes,
          updatedBy: session.username,
        },
      },
      { new: true }
    );

    if (!txn) {
      return NextResponse.json(
        { success: false, message: "Cash receipt not found or already handed over." },
        { status: 404 }
      );
    }

    void writeAudit({
      actor: session.username,
      action: "CASH_HANDOVER",
      entity: "Transaction",
      entityId: transactionId,
      bookingId: String(txn.bookingId || ""),
      detail: `INR ${Number(txn.amount || 0)} handed to company`,
    });

    return NextResponse.json({
      success: true,
      data: txn,
      message: "Cash marked as handed over to the company.",
    });
  } catch (error) {
    console.error("CASH HANDOVER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to record cash handover." },
      { status: 500 }
    );
  }
}
