import { NextResponse } from "next/server";
import { istDateKey, presentFestiveToday } from "@/lib/festiveCalendar";

export const dynamic = "force-dynamic";

/**
 * Alias for mobile clients: one brand calendar for website + app.
 * Same payload as /api/festive-today (Play Store builds may call either).
 */
export async function GET() {
  const now = new Date();
  const campaign = presentFestiveToday(now);
  return NextResponse.json(
    {
      date: istDateKey(now),
      timezone: "Asia/Kolkata",
      mode: campaign ? "campaign" : "normal",
      campaign,
      brand: {
        name: "EVUDDY",
        defaultThemeColor: "#F4C400",
        icons: {
          launcher: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.evuddy.com"}/brand/evuddy-android-launcher.png`,
          favicon: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.evuddy.com"}/icon-192.png`,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}