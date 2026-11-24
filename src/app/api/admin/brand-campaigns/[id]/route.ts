import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongodb";
import BrandCampaign, { type BrandCampaignStatus } from "@/models/BrandCampaign";
import { validateBrandCampaignFields } from "@/lib/brandCampaignValidation";
import { writeAudit } from "@/lib/writeAudit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "Only the super admin can manage brand campaigns." },
      { status: 403 }
    );
  }
  if (!(await rateLimitAllowed(`brand-campaign:${session.username}:${clientIp(request)}`, 60, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = body?.status as BrandCampaignStatus | undefined;
    if (body?.status !== undefined && !["draft", "published", "archived"].includes(status || "")) {
      return NextResponse.json({ success: false, message: "Invalid campaign status." }, { status: 400 });
    }

    await connectDB();
    const campaign = await BrandCampaign.findOne({ id });
    if (!campaign) {
      return NextResponse.json({ success: false, message: "Campaign not found." }, { status: 404 });
    }

    const fieldKeys = [
      "name", "theme", "start", "end", "ribbon", "welcomeTitle", "welcomeBody",
      "logoAccent", "heroImage", "priority",
    ] as const;
    const hasFields = fieldKeys.some((key) => Object.prototype.hasOwnProperty.call(body || {}, key));
    if (hasFields) {
      const parsed = validateBrandCampaignFields({ ...campaign.toObject(), ...body });
      if (!parsed.ok) {
        return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
      }
      Object.assign(campaign, parsed.value);
    }

    const nextStatus = status || campaign.status;
    if (nextStatus === "published") {
      const parsed = validateBrandCampaignFields(campaign.toObject());
      if (!parsed.ok) {
        return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
      }
    }

    campaign.status = nextStatus;
    campaign.updatedBy = session.username;
    await campaign.save();

    const action = status === "published"
      ? "BRAND_CAMPAIGN_PUBLISHED"
      : status === "archived"
        ? "BRAND_CAMPAIGN_ARCHIVED"
        : status === "draft"
          ? "BRAND_CAMPAIGN_UNPUBLISHED"
          : "BRAND_CAMPAIGN_UPDATED";
    await writeAudit({
      actor: session.username,
      action,
      entity: "BrandCampaign",
      entityId: campaign.id,
      detail: `${campaign.name} · ${campaign.status}`,
    });

    return NextResponse.json({ success: true, data: campaign.toObject() });
  } catch (cause) {
    console.error("BRAND CAMPAIGN UPDATE:", cause);
    return NextResponse.json(
      { success: false, message: "Brand campaign could not be updated." },
      { status: 500 }
    );
  }
}
