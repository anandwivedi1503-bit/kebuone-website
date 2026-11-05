import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { nextSeqId } from "@/lib/nextSeqId";
import { writeAudit } from "@/lib/writeAudit";
import PhoneBookingLead from "@/models/PhoneBookingLead";

const phoneRegex = /^[6-9]\d{9}$/;

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function GET() {
  try {
    const gate = await requireAdminDashboards("admin", "bookings");
    if (gate.error) return gate.error;

    await connectDB();
    const rows = await PhoneBookingLead.find({ $and: [NOT_DELETED_FILTER] })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("PHONE BOOKING LEADS GET:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load phone booking leads." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminDashboards("admin", "bookings");
    if (gate.error) return gate.error;

    await connectDB();
    const body = await req.json();
    const fullName = clean(body.fullName);
    const phone = clean(body.phone).replace(/\D/g, "").slice(-10);
    const errors: string[] = [];

    if (fullName.length < 3) errors.push("Enter rider name.");
    if (!phoneRegex.test(phone)) errors.push("Enter valid 10-digit mobile.");

    if (errors.length) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const leadId = await nextSeqId("PH", "phoneBookingLeadSequence", 6);
    const lead = await PhoneBookingLead.create({
      leadId,
      fullName,
      phone,
      altPhone: clean(body.altPhone).replace(/\D/g, "").slice(-10),
      city: clean(body.city) || "Lucknow",
      rentalMode: clean(body.rentalMode),
      vehiclePreference: clean(body.vehiclePreference),
      pickupDate: clean(body.pickupDate),
      notes: clean(body.notes).slice(0, 2000),
      status: "OPEN",
      assignedTo: clean(body.assignedTo) || gate.session?.username || "Helpdesk",
      linkedBookingId: clean(body.linkedBookingId).toUpperCase(),
      source: clean(body.source) || "Helpdesk call +91 8726006519",
    });

    void writeAudit({
      actor: gate.session?.username || "Admin",
      action: "PHONE_LEAD_CREATED",
      entity: "PhoneBookingLead",
      entityId: leadId,
      detail: phone,
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("PHONE BOOKING LEADS POST:", error);
    return NextResponse.json(
      { success: false, message: "Could not save phone booking lead." },
      { status: 500 }
    );
  }
}
