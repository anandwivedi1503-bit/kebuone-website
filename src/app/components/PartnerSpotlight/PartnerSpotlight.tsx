import Link from "next/link";
import { ArrowRight, Download, MapPin, Sparkles } from "lucide-react";

import YellowScooterImg from "../Brand/YellowScooterImg";
import { FLEET_INVESTMENT, FLEET_VEHICLE_PLANS, formatFleetRupees } from "@/lib/fleetInvestment";

const startingPlans = [
  {
    name: "Low-speed fleet",
    vehicles: "5 scooters",
    price: formatFleetRupees(FLEET_VEHICLE_PLANS["Low-speed EV scooter"].perScooter * 5),
    tone: "border-[#1AA65B]/20 bg-white/90",
    badge: "bg-[#DDF7E7] text-[#146B3B]",
  },
  {
    name: "High-speed fleet",
    vehicles: "5 scooters",
    price: formatFleetRupees(FLEET_VEHICLE_PLANS["High-speed EV scooter"].perScooter * 5),
    tone: "border-[#F2C629]/40 bg-[#FFF9DC]/95",
    badge: "bg-[#FFF0A7] text-[#705900]",
  },
];

/** Homepage campaign poster and investment overview, sourced from the official PDF. */
export default function PartnerSpotlight() {
  return (
    <section
      id="fleet-investment"
      className="scroll-mt-28 overflow-hidden border-y border-[#DCE8DE] bg-[linear-gradient(135deg,#F4FAF1_0%,#F8F5E9_52%,#E8F7EC_100%)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(16,55,36,0.14)] sm:rounded-[42px]">
          <div className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[#D7F6DC] blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#FFE99A]/70 blur-3xl" />

          <div className="grid lg:grid-cols-[1.03fr_0.97fr]">
            <div className="flex flex-col justify-center px-5 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-14">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#16834A]/15 bg-[#F0FAF2] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#16723F] sm:text-[11px]">
                <Sparkles size={14} /> EVUDDY Fleet Partner Program
              </div>

              <h2 className="font-display mt-6 max-w-xl text-[clamp(2.35rem,5.4vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#11251B]">
                Own the EVs.
                <span className="mt-2 block text-[#16834A]">We run the rides.</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#58685D] sm:text-base sm:leading-8">
                Build a scooter fleet with EVUDDY. You own the vehicles; our team runs the rider, hub and operating experience.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {startingPlans.map((plan) => (
                  <div key={plan.name} className={`rounded-2xl border p-4 shadow-[0_8px_28px_rgba(17,37,27,0.05)] ${plan.tone}`}>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${plan.badge}`}>
                      {plan.vehicles}
                    </span>
                    <p className="mt-3 text-xs font-semibold text-[#546057]">{plan.name}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-[#12231A]">{plan.price}</p>
                    <p className="mt-1 text-[11px] text-[#68736B]">Indicative starting investment</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/partners#partner-form"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#117A43] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(17,122,67,0.22)] transition hover:bg-[#0D6939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#117A43]"
                >
                  Explore the program <ArrowRight size={17} />
                </Link>
                <a
                  href={FLEET_INVESTMENT.pdfHref}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1A3424]/15 bg-white px-6 text-sm font-semibold text-[#1B3323] transition hover:border-[#16834A]/45 hover:bg-[#F8FCF8]"
                >
                  <Download size={16} /> Official PDF
                </a>
              </div>

              <p className="mt-5 max-w-xl text-[11px] leading-5 text-[#718076]">
                Starting amounts are from the official investment brief. Any return figures are indicative and subject to the signed Fleet Partner Agreement.
              </p>
            </div>

            <div className="relative min-h-[330px] overflow-hidden bg-[#153B2A] sm:min-h-[450px] lg:min-h-[620px]">
              <YellowScooterImg
                variant="ride"
                alt="EVUDDY scooter on an Indian city street"
                className="absolute inset-0 h-full w-full max-h-none max-w-none object-cover object-[55%_56%]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,28,19,0.04)_15%,rgba(12,28,19,0.72)_100%)] lg:bg-[linear-gradient(90deg,rgba(12,28,19,0.18)_0%,rgba(12,28,19,0.02)_36%,rgba(12,28,19,0.58)_100%)]" />
              <div className="absolute left-4 top-4 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:left-7 sm:top-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#647168]">Fleet operations</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#173B29]">
                  <MapPin size={15} className="text-[#16834A]" /> Lucknow, India
                </p>
              </div>
              <div className="absolute bottom-5 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
                <div className="max-w-xs text-white drop-shadow-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8F4DA]">Fleet owner · EVUDDY operator</p>
                  <p className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">A smarter way to grow with electric mobility.</p>
                </div>
                <span className="hidden rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur sm:inline-flex">EVUDDY · Fleet Partner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
