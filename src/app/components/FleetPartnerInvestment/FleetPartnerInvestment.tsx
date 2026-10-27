"use client";

import Link from "next/link";
import { ArrowRight, Download, Leaf, Radio, ShieldCheck, Sparkles } from "lucide-react";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import FleetPartnerDesignedPoster from "../FleetPartner/FleetPartnerDesignedPoster";

const FORM = "/partners#partner-form";

const highlights = [
  {
    icon: Sparkles,
    title: "Your capital. Our fleet.",
    text: "Fund yellow EVUDDY scooters on live hubs.",
  },
  {
    icon: Radio,
    title: "We operate every kilometre",
    text: "KYC, GPS, charging, pickup OTP and rider support on EVUDDY.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent paperwork",
    text: "Official brief as PDF — terms confirmed in writing.",
  },
  {
    icon: Leaf,
    title: "Clean mobility, real demand",
    text: "Hourly to Rent to Own — partners grow the fleet behind riders.",
  },
];

export default function FleetPartnerInvestment() {
  return (
    <section
      id="fleet-investment"
      className="relative scroll-mt-36 overflow-hidden border-t border-[#E4DDD2] bg-white py-14 sm:py-20"
    >
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#18B368]">
              Fleet partner investment
            </p>
            <h1
              id="investment-poster"
              className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[#0A1134]"
            >
              Put capital on India&apos;s
              <span className="mt-1 block text-[#18B368]">yellow EV fleet.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#5C635E] sm:text-[15px]">
              {FLEET_INVESTMENT.company} operates EVUDDY. You grow the fleet; we run yards, riders,
              and software. Download the brief, then apply — no payment on this site.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={FLEET_INVESTMENT.pdfHref}
                download={FLEET_INVESTMENT.pdfFileName}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 text-sm font-semibold text-white transition hover:bg-[#14a05c]"
              >
                <Download size={18} />
                Download PDF
              </a>
              <Link
                href={FORM}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0A1134]/12 px-8 text-sm font-semibold text-[#0A1134] transition hover:border-[#18B368]/40"
              >
                Apply as partner
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <FleetPartnerDesignedPoster />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#18B368]/12 bg-[#F7FAF8] p-5 transition hover:border-[#18B368]/25"
              >
                <Icon size={18} className="text-[#18B368]" strokeWidth={1.75} />
                <h3 className="mt-3 text-sm font-semibold text-[#0A1134]">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#5C635E] sm:text-sm">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
