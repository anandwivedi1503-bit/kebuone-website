import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { writeAudit } from "@/lib/writeAudit";
import PhoneBookingLead from "@/models/PhoneBookingLead";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireAdminDashboards("admin", "bookings");
    if (gate.error) return gate.error;

    const { id } = await ctx.params;
    await connectDB();
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.status !== undefined) update.status = clean(body.status).toUpperCase();
    if (body.notes !== undefined) update.notes = clean(body.notes).slice(0, 2000);
    if (body.assignedTo !== undefined) update.assignedTo = clean(body.assignedTo).slice(0, 80);
    if (body.linkedBookingId !== undefined) {
      update.linkedBookingId = clean(body.linkedBookingId).toUpperCase();
    }

    const lead = await PhoneBookingLead.findOneAndUpdate(
      { $and: [NOT_DELETED_FILTER, { _id: id }] },
      update,
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found." }, { status: 404 });
    }

    void writeAudit({
      actor: gate.session?.username || "Admin",
      action: "PHONE_LEAD_UPDATED",
      entity: "PhoneBookingLead",
      entityId: lead.leadId,
      detail: String(update.status || ""),
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("PHONE BOOKING LEAD PATCH:", error);
    return NextResponse.json(
      { success: false, message: "Update failed." },
      { status: 500 }
    );
  }
}
