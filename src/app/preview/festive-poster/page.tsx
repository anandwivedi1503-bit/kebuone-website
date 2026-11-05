import { listFestiveCampaigns, resolveFestivePresentation } from "@/lib/festiveCalendar";
import FestivePosterPreviewClient from "./FestivePosterPreviewClient";

export const metadata = {
  title: "Festive poster preview | EVUDDY",
  robots: { index: false, follow: false },
};

export default function FestivePosterPreviewPage() {
  const diwali = listFestiveCampaigns().find((c) => c.id === "diwali-2026");
  const campaign = diwali ? resolveFestivePresentation(diwali) : null;
  const title = campaign?.welcomeTitle ?? "Festive rides in Lucknow";
  const body =
    campaign?.welcomeBody ??
    "Light up the city with a safe electric ride. Book EV at your Lucknow hub for sweets runs, family visits, and pollution-free festive commutes.";

  return (
    <main className="min-h-svh bg-[#0A1134] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl text-center text-white/80">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#F4C430] uppercase">Internal preview</p>
        <h1 className="font-display mt-3 text-2xl font-semibold text-white">Diwali welcome poster</h1>
        <p className="mt-2 text-sm text-white/70">
          This is how the popup appears on the live site during Diwali season (first visit per session).
        </p>
      </div>

      <FestivePosterPreviewClient title={title} body={body} />

      <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-white/25 px-5 py-8 text-center text-sm text-white/65">
        On the live homepage, this poster opens once per browser session over a soft blur — same layout as above,
        with Book EV and Continue browsing actions below the gold footer bar.
      </div>
    </main>
  );
}
