import BrandCampaign, { type IBrandCampaign } from "@/models/BrandCampaign";
import { connectDB } from "@/lib/mongodb";
import {
  istDateKey,
  presentFestiveToday,
  type FestivePresentation,
} from "@/lib/festiveCalendar";

function presentManagedCampaign(
  campaign: IBrandCampaign,
  now: Date
): FestivePresentation | null {
  if (campaign.theme === "normal") return null;

  const date = istDateKey(now);
  return {
    id: campaign.id,
    theme: campaign.theme,
    start: campaign.start,
    end: campaign.end,
    ribbon: campaign.ribbon,
    welcomeTitle: campaign.welcomeTitle,
    welcomeBody: campaign.welcomeBody,
    logoAccent: campaign.logoAccent,
    heroImage: campaign.heroImage,
    date,
    sessionKey: `${campaign.id}:${date}`,
  };
}

/**
 * Resolve the shared website/app campaign. Published database entries override
 * the legacy static calendar only inside their IST date window. If the database
 * is unavailable, the existing static calendar remains a safe fallback.
 */
export async function getSharedFestiveCampaign(
  now = new Date()
): Promise<FestivePresentation | null> {
  if (process.env.NEXT_PUBLIC_FESTIVE_OFF === "1") return null;

  // Preserve existing emergency/operator overrides while campaigns move to the
  // shared database calendar.
  const forcedTheme = process.env.NEXT_PUBLIC_FESTIVE_THEME?.trim();
  if (forcedTheme) return presentFestiveToday(now);
  if (process.env.NEXT_PUBLIC_CHHATH_ON === "1" || process.env.NEXT_PUBLIC_DIWALI_ON === "1") {
    return presentFestiveToday(now);
  }

  try {
    const today = istDateKey(now);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const campaign = await Promise.race([
      (async () => {
        await connectDB();
        const published = await BrandCampaign.findOne({
          status: "published",
          start: { $lte: today },
          end: { $gte: today },
        })
          .sort({ priority: -1, start: -1, updatedAt: -1 })
          .lean<IBrandCampaign>();

        if (published) return published;

        return BrandCampaign.findOne({
          status: "archived",
          start: { $lte: today },
          end: { $gte: today },
        })
          .sort({ priority: -1, start: -1, updatedAt: -1 })
          .lean<IBrandCampaign>();
      })(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 5000);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });

    if (campaign?.status === "archived") return null;
    if (campaign) return presentManagedCampaign(campaign, now);
  } catch (error) {
    console.error("SHARED BRAND CALENDAR FALLBACK:", error);
  }

  return presentFestiveToday(now);
}
