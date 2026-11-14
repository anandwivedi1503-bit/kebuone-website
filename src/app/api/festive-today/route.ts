import { NextResponse } from "next/server";
import { istDateKey, presentFestiveToday } from "@/lib/festiveCalendar";

export const dynamic = "force-dynamic";

/** Server clock in Asia/Kolkata. The landing page asks this on each visit and again at midnight. */
export async function GET() {
  const now = new Date();
  return NextResponse.json(
    {
      date: istDateKey(now),
      timezone: "Asia/Kolkata",
      campaign: presentFestiveToday(now),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
