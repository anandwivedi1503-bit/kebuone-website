import type { Metadata } from "next";
import ModernLandingPreview from "./ModernLandingPreview";

export const metadata: Metadata = {
  title: "EVUDDY landing blueprint preview",
  description: "Internal preview for the 2026 modern landing redesign — not indexed.",
  robots: { index: false, follow: false },
};

export default function Landing2026PreviewPage() {
  return <ModernLandingPreview />;
}