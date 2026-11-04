/** IST calendar date parts for seasonal UI (client or server). */
export function istCalendarParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value || 0);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
  };
}

/** Diwali window: mid-Oct through third week of Nov (IST). Override with env flags. */
export function isDiwaliSeason(now = new Date()): boolean {
  if (process.env.NEXT_PUBLIC_DIWALI_OFF === "1") return false;
  if (process.env.NEXT_PUBLIC_DIWALI_ON === "1") return true;

  const { month, day } = istCalendarParts(now);
  if (month === 10 && day >= 15) return true;
  if (month === 11 && day <= 20) return true;
  return false;
}

export const DIWALI_SESSION_KEY = "evuddy-diwali-welcome-2026";
