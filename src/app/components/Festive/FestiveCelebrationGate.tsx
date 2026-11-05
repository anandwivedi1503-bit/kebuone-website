"use client";

import { usePathname } from "next/navigation";
import { getActiveFestiveCampaign } from "@/lib/festiveCalendar";
import DiwaliCelebration from "../Diwali/DiwaliCelebration";
import FestiveThemeExperience from "./FestiveThemeExperience";

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Calendar-driven festive layer (Diwali = full lights; other festivals = themed site + modal). */
export default function FestiveCelebrationGate() {
  const pathname = usePathname() || "";
  if (isOpsPath(pathname)) return null;

  const campaign = getActiveFestiveCampaign();
  if (!campaign) return null;

  if (campaign.theme === "diwali") {
    return <DiwaliCelebration />;
  }

  return <FestiveThemeExperience campaign={campaign} />;
}
