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
  theme:
    | "diwali"
    | "chhath"
    | "holi"
    | "republic"
    | "independence"
    | "christmas"
    | "eid"
    | "navratri"
    | "rakhi"
    | "newyear";
  start: string;
  end: string;
  /** Accent for logo glow (hex). */
  logoAccent: string;
  sessionKey: string;
  /** Optional IST date (YYYY-MM-DD) overrides inside the campaign window. */
  dayThemes?: Record<
    string,
    { ribbon?: string; welcomeTitle?: string; welcomeBody?: string; logoAccent?: string }
  >;
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
    end: "2026-11-12",
    ribbon: "✦ शुभ दीपावली · Happy Diwali · Ride electric, ride bright ✦",
    welcomeTitle: "Happy Diwali from EVUDDY",
    welcomeBody:
      "Light up the city with a safe electric ride. Wishing you and your family a bright Diwali.",
    logoAccent: "#FFD700",
    sessionKey: "evuddy-diwali-welcome-2026",
    dayThemes: {
      "2026-10-15": {
        ribbon: "✦ Dhanteras · Prosperity & safe electric rides ✦",
        welcomeTitle: "Shubh Dhanteras",
        logoAccent: "#F59E0B",
      },
      "2026-10-16": {
        ribbon: "✦ Choti Diwali · Light the way with EVUDDY ✦",
        welcomeTitle: "Choti Diwali wishes",
        logoAccent: "#FB923C",
      },
      "2026-10-17": {
        ribbon: "✦ Naraka Chaturdashi · Ride bright, ride safe ✦",
        welcomeTitle: "Naraka Chaturdashi",
        logoAccent: "#F97316",
      },
      "2026-10-18": {
        ribbon: "✦ Lakshmi Puja · Happy Diwali from EVUDDY ✦",
        welcomeTitle: "Happy Diwali",
        welcomeBody:
          "May your home and streets glow with joy. Book EV in Lucknow for safe festive rides.",
        logoAccent: "#FFD700",
      },
      "2026-10-19": {
        ribbon: "✦ Govardhan Puja · Gratitude & green mobility ✦",
        welcomeTitle: "Happy Govardhan Puja",
        logoAccent: "#22C55E",
      },
      "2026-10-20": {
        ribbon: "✦ Bhai Dooj · Celebrate together, ride electric ✦",
        welcomeTitle: "Happy Bhai Dooj",
        logoAccent: "#F472B6",
      },
      "2026-11-05": {
        ribbon: "✦ Diwali week · EVUDDY Lucknow rides ✦",
        welcomeTitle: "Festive rides in Lucknow",
        logoAccent: "#FFD700",
      },
    },
  },
  {
    id: "chhath-2026",
    theme: "chhath",
    start: "2026-11-13",
    end: "2026-11-17",
    ribbon: "✦ छठ पूजा · Chhath Puja · Safe electric rides to every ghat ✦",
    welcomeTitle: "Chhath Puja wishes from EVUDDY",
    welcomeBody:
      "Offer your prayers with devotion — reach the ghat on time with a quiet, pollution-free EV ride. Warm wishes from the EVUDDY family across Lucknow.",
    logoAccent: "#F97316",
    sessionKey: "evuddy-chhath-welcome-2026",
    dayThemes: {
      "2026-11-13": {
        ribbon: "✦ नहाय खाय · Start Chhath with a clean ride ✦",
        welcomeTitle: "Shubh Nahay Khay",
        welcomeBody:
          "Begin the sacred festival with purity. EVUDDY hubs are open for your first ride of Chhath Puja week.",
        logoAccent: "#EA580C",
      },
      "2026-11-14": {
        ribbon: "✦ खरना · Strength for the vrat, safe rides from EVUDDY ✦",
        welcomeTitle: "Kharna blessings",
        welcomeBody:
          "May your fast bring peace and prosperity. Book an electric scooter when you need a reliable ride.",
        logoAccent: "#FB923C",
      },
      "2026-11-15": {
        ribbon: "✦ संध्या अर्घ्य · Sandhya Arghya · Ride to the river, ride electric ✦",
        welcomeTitle: "Sandhya Arghya",
        welcomeBody:
          "As the Sun sets, we wish you a blessed evening offering. Travel safely to and from the ghat with EVUDDY.",
        logoAccent: "#F97316",
      },
      "2026-11-16": {
        ribbon: "✦ उषा अर्घ्य · Usha Arghya · Greet Surya Dev with gratitude ✦",
        welcomeTitle: "Usha Arghya",
        welcomeBody:
          "Welcome the rising Sun with devotion. Early-morning hub pickups are ready when you are.",
        logoAccent: "#FBBF24",
      },
      "2026-11-17": {
        ribbon: "✦ छठ पूजा समापन · Thank you for riding with EVUDDY ✦",
        welcomeTitle: "Chhath blessings",
        logoAccent: "#F59E0B",
      },
    },
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
  {
    id: "newyear-2027",
    theme: "newyear",
    start: "2026-12-28",
    end: "2027-01-02",
    ribbon: "✦ Happy New Year · Ride electric into 2027 ✦",
    welcomeTitle: "Happy New Year from EVUDDY",
    welcomeBody: "Start the year with clean rides and safe pickups. Wishing you a bright, electric 2027.",
    logoAccent: "#FFD700",
    sessionKey: "evuddy-festive-newyear-2027",
  },
  {
    id: "republic-2027",
    theme: "republic",
    start: "2027-01-25",
    end: "2027-01-27",
    ribbon: "✦ Jai Hind · Happy Republic Day ✦",
    welcomeTitle: "Happy Republic Day",
    welcomeBody: "Proud to serve riders on India’s roads. Book EV, ride safe, ride electric.",
    logoAccent: "#FF9933",
    sessionKey: "evuddy-festive-republic-2027",
  },
  {
    id: "independence-2027",
    theme: "independence",
    start: "2027-08-14",
    end: "2027-08-16",
    ribbon: "✦ Happy Independence Day · Ride free, ride electric ✦",
    welcomeTitle: "Happy Independence Day",
    welcomeBody: "Honouring India’s spirit with cleaner last-mile rides across our live cities.",
    logoAccent: "#138808",
    sessionKey: "evuddy-festive-independence-2027",
  },
  {
    id: "christmas-2027",
    theme: "christmas",
    start: "2027-12-20",
    end: "2027-12-27",
    ribbon: "✦ Merry Christmas · Warm wishes from EVUDDY ✦",
    welcomeTitle: "Merry Christmas",
    welcomeBody: "Holiday errands and celebrations — your electric scooter is a tap away.",
    logoAccent: "#DC2626",
    sessionKey: "evuddy-festive-christmas-2027",
  },
];

export function istDateKey(now = new Date()) {
  const { year, month, day } = istCalendarParts(now);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** Milliseconds until the next midnight in Asia/Kolkata. */
export function msUntilNextIstMidnight(now = new Date()) {
  const key = istDateKey(now);
  const start = new Date(`${key}T00:00:00+05:30`).getTime();
  const next = start + 24 * 60 * 60 * 1000;
  return Math.max(1000, next - now.getTime());
}

function compareIso(a: string, b: string) {
  return a.localeCompare(b);
}

function campaignByTheme(theme: FestiveCampaign["theme"]) {
  return CAMPAIGNS.find((c) => c.theme === theme) ?? null;
}

/** Highest-priority active campaign for today (IST), if any. */
export function getActiveFestiveCampaign(now = new Date()): FestiveCampaign | null {
  if (process.env.NEXT_PUBLIC_FESTIVE_OFF === "1") return null;
  const forced = process.env.NEXT_PUBLIC_FESTIVE_THEME?.trim();
  if (forced) {
    const match = CAMPAIGNS.find((c) => c.id === forced || c.theme === forced);
    if (match) return match;
  }
  if (process.env.NEXT_PUBLIC_CHHATH_ON === "1") return campaignByTheme("chhath");
  if (process.env.NEXT_PUBLIC_DIWALI_ON === "1") return campaignByTheme("diwali");

  const today = istDateKey(now);
  const active = CAMPAIGNS.filter((c) => {
    if (c.theme === "chhath" && process.env.NEXT_PUBLIC_CHHATH_OFF === "1") return false;
    if (c.theme === "diwali" && process.env.NEXT_PUBLIC_DIWALI_OFF === "1") return false;
    return compareIso(c.start, today) <= 0 && compareIso(today, c.end) <= 0;
  });
  if (active.length === 0) return null;
  return active.sort((a, b) => compareIso(b.start, a.start))[0];
}

export type FestivePresentation = Omit<FestiveCampaign, "dayThemes"> & { date: string };

/**
 * What the site should show right now. Called on every festive-today request
 * from the server clock (Asia/Kolkata). Day copy and the poster key change
 * with the date, so a deploy is not required each morning.
 */
export function presentFestiveToday(now = new Date()): FestivePresentation | null {
  const base = getActiveFestiveCampaign(now);
  if (!base) return null;
  const view = resolveFestivePresentation(base, now);
  const date = istDateKey(now);
  const { dayThemes, ...rest } = view;
  void dayThemes;
  return {
    ...rest,
    date,
    sessionKey: `${view.sessionKey}:${date}`,
  };
}

export function listFestiveCampaigns() {
  return CAMPAIGNS.slice();
}

/** Merge campaign defaults with IST day-specific copy when configured. */
export function resolveFestivePresentation(
  campaign: FestiveCampaign,
  now = new Date()
): FestiveCampaign {
  const day = istDateKey(now);
  const overlay = campaign.dayThemes?.[day];
  if (!overlay) return campaign;
  return {
    ...campaign,
    ribbon: overlay.ribbon ?? campaign.ribbon,
    welcomeTitle: overlay.welcomeTitle ?? campaign.welcomeTitle,
    welcomeBody: overlay.welcomeBody ?? campaign.welcomeBody,
    logoAccent: overlay.logoAccent ?? campaign.logoAccent,
  };
}
