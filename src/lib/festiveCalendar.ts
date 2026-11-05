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

/** One IST-inclusive campaign window (YYYY-MM-DD in Asia/Kolkata). */
export type FestiveCampaign = {
  id: string;
  /** Shown in ribbon / modal — keep copy short. */
  ribbon: string;
  welcomeTitle: string;
  welcomeBody: string;
  /** html[data-evuddy-festive] value — drives CSS theme tokens. */
  theme: "diwali" | "holi" | "republic" | "independence" | "christmas" | "eid" | "navratri" | "rakhi" | "newyear";
  start: string;
  end: string;
  /** Accent for logo glow (hex). */
  logoAccent: string;
  sessionKey: string;
};

/**
 * Campaign calendar (IST). Major movable festivals are pinned per year — same approach
 * food-delivery brands use for seasonal skins (date tables + CSS variables, not lunar math in the browser).
 */
const CAMPAIGNS: FestiveCampaign[] = [
  {
    id: "newyear-2026",
    theme: "newyear",
    start: "2025-12-28",
    end: "2026-01-03",
    ribbon: "✦ Happy New Year · Ride electric into 2026 ✦",
    welcomeTitle: "Happy New Year from EVUDDY",
    welcomeBody:
      "Start the year with clean rides and safe pickups. Wishing you a bright, electric 2026.",
    logoAccent: "#FFD700",
    sessionKey: "evuddy-festive-newyear-2026",
  },
  {
    id: "republic-2026",
    theme: "republic",
    start: "2026-01-25",
    end: "2026-01-27",
    ribbon: "✦ Jai Hind · Happy Republic Day ✦",
    welcomeTitle: "Happy Republic Day",
    welcomeBody: "Proud to serve riders on India’s roads. Book EV, ride safe, ride electric.",
    logoAccent: "#FF9933",
    sessionKey: "evuddy-festive-republic-2026",
  },
  {
    id: "holi-2026",
    theme: "holi",
    start: "2026-03-01",
    end: "2026-03-10",
    ribbon: "✦ Happy Holi · Ride safe, ride colourful ✦",
    welcomeTitle: "Happy Holi",
    welcomeBody: "Celebrate with care — EVUDDY hubs are open for your next electric ride.",
    logoAccent: "#E11D48",
    sessionKey: "evuddy-festive-holi-2026",
  },
  {
    id: "eid-2026",
    theme: "eid",
    start: "2026-03-29",
    end: "2026-04-02",
    ribbon: "✦ Eid Mubarak · Safe rides to every celebration ✦",
    welcomeTitle: "Eid Mubarak",
    welcomeBody: "Warm wishes from the EVUDDY team. Book your scooter when you are ready to ride.",
    logoAccent: "#18B368",
    sessionKey: "evuddy-festive-eid-2026",
  },
  {
    id: "independence-2026",
    theme: "independence",
    start: "2026-08-14",
    end: "2026-08-16",
    ribbon: "✦ Happy Independence Day · Ride free, ride electric ✦",
    welcomeTitle: "Happy Independence Day",
    welcomeBody: "Honouring India’s spirit with cleaner last-mile rides across our live cities.",
    logoAccent: "#138808",
    sessionKey: "evuddy-festive-independence-2026",
  },
  {
    id: "rakhi-2026",
    theme: "rakhi",
    start: "2026-08-26",
    end: "2026-08-30",
    ribbon: "✦ Happy Raksha Bandhan · Deliver love, ride safe ✦",
    welcomeTitle: "Happy Raksha Bandhan",
    welcomeBody: "Reach your celebrations on time with EVUDDY electric scooters.",
    logoAccent: "#F472B6",
    sessionKey: "evuddy-festive-rakhi-2026",
  },
  {
    id: "navratri-2026",
    theme: "navratri",
    start: "2026-09-28",
    end: "2026-10-14",
    ribbon: "✦ Shubh Navratri · Nine nights, one smart ride ✦",
    welcomeTitle: "Shubh Navratri",
    welcomeBody: "Festive commutes made easy — pickup from your EVUDDY hub in Lucknow.",
    logoAccent: "#A855F7",
    sessionKey: "evuddy-festive-navratri-2026",
  },
  {
    id: "diwali-2026",
    theme: "diwali",
    start: "2026-10-15",
    end: "2026-11-20",
    ribbon: "✦ शुभ दीपावली · Happy Diwali · Ride electric, ride bright ✦",
    welcomeTitle: "Happy Diwali from EVUDDY",
    welcomeBody:
      "Light up the city with a safe electric ride. Wishing you and your family a bright Diwali.",
    logoAccent: "#FFD700",
    sessionKey: "evuddy-diwali-welcome-2026",
  },
  {
    id: "christmas-2026",
    theme: "christmas",
    start: "2026-12-20",
    end: "2026-12-27",
    ribbon: "✦ Merry Christmas · Warm wishes from EVUDDY ✦",
    welcomeTitle: "Merry Christmas",
    welcomeBody: "Holiday errands and celebrations — your electric scooter is a tap away.",
    logoAccent: "#DC2626",
    sessionKey: "evuddy-festive-christmas-2026",
  },
];

function istDateKey(now = new Date()) {
  const { year, month, day } = istCalendarParts(now);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function compareIso(a: string, b: string) {
  return a.localeCompare(b);
}

/** Highest-priority active campaign for today (IST), if any. */
export function getActiveFestiveCampaign(now = new Date()): FestiveCampaign | null {
  if (process.env.NEXT_PUBLIC_FESTIVE_OFF === "1") return null;
  const forced = process.env.NEXT_PUBLIC_FESTIVE_THEME?.trim();
  if (forced) {
    const match = CAMPAIGNS.find((c) => c.id === forced || c.theme === forced);
    if (match) return match;
  }

  const today = istDateKey(now);
  const active = CAMPAIGNS.filter(
    (c) => compareIso(c.start, today) <= 0 && compareIso(today, c.end) <= 0
  );
  if (active.length === 0) return null;
  return active.sort((a, b) => compareIso(b.start, a.start))[0];
}

export function listFestiveCampaigns() {
  return CAMPAIGNS.slice();
}
