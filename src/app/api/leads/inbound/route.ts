import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { providedSecretMatches } from "@/lib/timingSafe";
import { writeAudit } from "@/lib/writeAudit";
import Partner from "@/models/Partner";

function clean(value: unknown) {
  return String(value || "").trim();
}

/**
 * Meta Lead Ads / Google Ads webhook → Partner desk.
 * Set LEADS_WEBHOOK_SECRET on EC2 and use the same value in your ad platform POST URL:
 * POST /api/leads/inbound  Header: x-leads-secret: <secret>
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.LEADS_WEBHOOK_SECRET || "";
    if (!secret || !providedSecretMatches(secret, req.headers.get("x-leads-secret") || "")) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const body = await req.json().catch(() => ({}));

    const fullName = clean(body.fullName || body.name || body.first_name);
    const phone = clean(body.phone || body.phone_number || body.mobile)
      .replace(/\D/g, "")
      .slice(-10);
    const email = clean(body.email || body.email_address).toLowerCase();
    const city = clean(body.city) || "Lucknow";
    const state = clean(body.state) || "Uttar Pradesh";
    const sourceRaw = clean(body.source || body.platform || "Ad lead").toLowerCase();
    const comingThrough =
      sourceRaw.includes("google") ? "Google Ads" : sourceRaw.includes("meta") || sourceRaw.includes("facebook") ? "Meta Ads" : "Direct / EVUDDY";

    if (fullName.length < 2 || phone.length !== 10 || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "fullName, 10-digit phone, and email required." },
        { status: 400 }
      );
    }

    const partner = await Partner.create({
      fullName,
      phone,
      email,
      state,
      city,
      partnerType: clean(body.partnerType) || "Fleet Partner Investment",
      organizationName: clean(body.organizationName),
      message: clean(body.message || body.notes).slice(0, 1000),
      comingThrough,
      applicationStatus: "Pending",
      applicationStage: "New",
      adminRemarks: `Inbound ad lead · ${comingThrough}`,
    });

    void writeAudit({
      actor: "AdWebhook",
      action: "PARTNER_LEAD_INBOUND",
      entity: "Partner",
      entityId: String(partner._id),
      detail: comingThrough,
    });

    return NextResponse.json({ success: true, data: { id: partner._id } }, { status: 201 });
  } catch (error) {
    console.error("LEADS INBOUND:", error);
    return NextResponse.json({ success: false, message: "Lead ingest failed." }, { status: 500 });
  }
}
