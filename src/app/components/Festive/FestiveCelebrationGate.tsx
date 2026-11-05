"use client";

import { usePathname } from "next/navigation";
import { getActiveFestiveCampaign, resolveFestivePresentation } from "@/lib/festiveCalendar";
import DiwaliCelebration from "../Diwali/DiwaliCelebration";
import FestiveThemeExperience from "./FestiveThemeExperience";

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Calendar-driven festive layer (Diwali = full lights; other festivals = themed site + modal). */
export default function FestiveCelebrationGate() {
  const pathname = usePathname() || "";
  if (isOpsPath(pathname)) return null;

  const base = getActiveFestiveCampaign();
  if (!base) return null;

  const campaign = resolveFestivePresentation(base);

  if (campaign.theme === "diwali") {
    return <DiwaliCelebration campaign={campaign} />;
  }

  return <FestiveThemeExperience campaign={campaign} />;
}
