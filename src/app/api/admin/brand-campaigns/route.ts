import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongodb";
import BrandCampaign from "@/models/BrandCampaign";
import { validateBrandCampaignFields } from "@/lib/brandCampaignValidation";
import { writeAudit } from "@/lib/writeAudit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize(request: Request) {
  const session = await getAdminSession();
  if (!session) return { session: null, error: unauthorizedResponse() };
  if (session.role !== "super") {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, message: "Only the super admin can manage brand campaigns." },
        { status: 403 }
      ),
    };
  }
  if (!(await rateLimitAllowed(`brand-campaign:${session.username}:${clientIp(request)}`, 60, 60 * 1000))) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, message: "Please wait a moment before trying again." },
        { status: 429 }
      ),
    };
  }
  return { session, error: null };
}

export async function GET(request: Request) {
  const { session, error } = await authorize(request);
  if (error) return error;
  if (!session) return unauthorizedResponse();

  try {
    await connectDB();
    const data = await BrandCampaign.find({})
      .sort({ start: 1, priority: -1, updatedAt: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ success: true, data });
  } catch (cause) {
    console.error("BRAND CAMPAIGNS LOAD:", cause);
    return NextResponse.json(
      { success: false, message: "Brand campaigns could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, error } = await authorize(request);
  if (error) return error;
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = validateBrandCampaignFields(body);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    await connectDB();
    const slug = parsed.value.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "campaign";
    const campaign = await BrandCampaign.create({
      ...parsed.value,
      id: `${slug}-${randomBytes(5).toString("hex")}`,
      status: "draft",
      createdBy: session.username,
      updatedBy: session.username,
    });

    await writeAudit({
      actor: session.username,
      action: "BRAND_CAMPAIGN_CREATED",
      entity: "BrandCampaign",
      entityId: campaign.id,
      detail: `Created draft ${campaign.name}`,
    });

    return NextResponse.json({ success: true, data: campaign.toObject() }, { status: 201 });
  } catch (cause) {
    console.error("BRAND CAMPAIGN CREATE:", cause);
    return NextResponse.json(
      { success: false, message: "Brand campaign could not be saved." },
      { status: 500 }
    );
  }
}
