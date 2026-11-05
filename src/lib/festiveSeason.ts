export { istCalendarParts } from "@/lib/festiveCalendar";
import { getActiveFestiveCampaign } from "@/lib/festiveCalendar";

/** Diwali window: driven by festive calendar (IST). Override with env flags. */
export function isDiwaliSeason(now = new Date()): boolean {
  if (process.env.NEXT_PUBLIC_DIWALI_OFF === "1") return false;
  if (process.env.NEXT_PUBLIC_DIWALI_ON === "1") return true;
  return getActiveFestiveCampaign(now)?.theme === "diwali";
}

export const DIWALI_SESSION_KEY = "evuddy-diwali-welcome-2026";
