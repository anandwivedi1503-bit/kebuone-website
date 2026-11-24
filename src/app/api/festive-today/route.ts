import { NextResponse } from "next/server";
import { getSharedFestiveCampaign } from "@/lib/brandCampaignCalendar";
import { istDateKey } from "@/lib/festiveCalendar";

export const dynamic = "force-dynamic";

/**
 * Shared brand calendar for the website and the Play Store app.
 * Both clients poll this. When the IST window ends, `campaign` is null and
 * both return to the normal theme without a store release.
 * The Play Console listing icon is separate — Google does not let a backend
 * swap the store icon. In-app ribbons, colours, and copy do follow this API.
 */
export async function GET() {
  const now = new Date();
  const campaign = await getSharedFestiveCampaign(now);
  return NextResponse.json(
    {
      date: istDateKey(now),
      timezone: "Asia/Kolkata",
      mode: campaign ? "campaign" : "normal",
      campaign,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
