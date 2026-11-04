"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isDiwaliSeason } from "@/lib/festiveSeason";

const DiwaliCelebration = dynamic(() => import("./DiwaliCelebration"), { ssr: false });

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Festive layer on public marketing + booking pages only. */
export default function DiwaliCelebrationGate() {
  const pathname = usePathname() || "";
  if (!isDiwaliSeason() || isOpsPath(pathname)) return null;
  return <DiwaliCelebration />;
}
