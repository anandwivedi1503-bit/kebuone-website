"use client";

import Link from "next/link";
import { ArrowRight, Download, Leaf, Radio, ShieldCheck, Sparkles } from "lucide-react";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import FleetPartnerDesignedPoster from "../FleetPartner/FleetPartnerDesignedPoster";
import HomeImg from "../HomeMedia/HomeImg";

const FORM = "/partners#partner-form";

const highlights = [
  {
    icon: Sparkles,
    title: "Your capital. Our fleet.",
    text: "Fund yellow EVUDDY scooters. We place them on live hubs in the city.",
  },
  {
    icon: Radio,
    title: "We operate every kilometre",
    text: "KYC, GPS, charging, pickup OTP and rider support stay on the EVUDDY platform.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent paperwork",
    text: "The official brief is a download — not a calculator buried in the page.",
  },
  {
    icon: Leaf,
    title: "Clean mobility, real demand",
    text: "Riders book hourly to monthly and Rent to Own. Partners grow the fleet behind them.",
  },
];

export default function FleetPartnerInvestment(_props?: { posterPriority?: boolean }) {
  return (
    <section
      id="fleet-investment"
      className="relative scroll-mt-36 overflow-hidden border-t border-[#E4DDD2] bg-[#F7F4EE] py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#1F6B4A]/12 blur-[120px]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[#F4C430]/15 blur-[110px]" />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#5F6B63]">
              Fleet partner
            </p>
            <h2
              id="investment-poster"
              className="font-display mt-4 text-4xl font-medium tracking-[-0.04em] text-[#1C1917] sm:text-6xl"
            >
              Put your capital on
              <span className="mt-1 block italic text-[#1F6B4A]">India&apos;s yellow EV fleet.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#5C635E]">
              {FLEET_INVESTMENT.company} operates EVUDDY. You grow the fleet. We run the yards,
              the riders, and the software. Download the official brief — then apply. No payment
              on this website.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={FLEET_INVESTMENT.pdfHref}
                download={FLEET_INVESTMENT.pdfFileName}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-8 text-[13px] font-semibold tracking-[0.08em] text-white transition hover:bg-[#18573c]"
              >
                <Download size={18} />
                Download PDF
              </a>
              <Link
                href={FORM}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#1C1917]/12 bg-white px-8 text-[13px] font-semibold tracking-[0.08em] text-[#1C1917] transition hover:border-[#1F6B4A]/40"
              >
                Apply as a partner
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-4 text-xs tracking-[0.04em] text-[#8A847A]">
              Choose Fleet Partner Investment on the form. We confirm terms in writing.
            </p>
          </div>

          <div className="space-y-4">
            <FleetPartnerDesignedPoster />
            <div className="rounded-2xl border border-[#E4DDD2] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A847A]">
                Original slide
              </p>
              <HomeImg
                src={FLEET_INVESTMENT.posterSrc}
                alt="Original fleet partner presentation poster"
                className="mt-3 max-h-[280px] w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-[#E4DDD2] bg-white p-5">
                <Icon size={18} strokeWidth={1.5} className="text-[#1F6B4A]" />
                <h3 className="mt-4 font-medium text-[#1C1917]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C635E]">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
