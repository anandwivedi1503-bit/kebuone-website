"use client";

import Link from "next/link";
import { ArrowRight, Download, Leaf, Radio, ShieldCheck, Sparkles } from "lucide-react";

import { BRAND } from "@/lib/brandMedia";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
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
      className="relative scroll-mt-36 overflow-hidden bg-[#07130F] py-16 text-white sm:py-24"
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#1F6B4A]/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[#F4C430]/20 blur-[110px]" />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#A8E6C3]">
              Fleet partner
            </p>
            <h2
              id="investment-poster"
              className="font-display mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl"
            >
              Put your capital on
              <span className="mt-1 block italic text-[#F4C430]">India&apos;s yellow EV fleet.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-8 text-white/70">
              {FLEET_INVESTMENT.company} operates EVUDDY. You grow the fleet. We run the yards,
              the riders, and the software. Download the official brief — then apply. No payment
              on this website.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={FLEET_INVESTMENT.pdfHref}
                download={FLEET_INVESTMENT.pdfFileName}
                className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#F4C430] px-8 text-[13px] font-medium tracking-[0.08em] text-[#07130F] transition hover:bg-[#ffe08a]"
              >
                <Download size={18} />
                Download PDF
              </a>
              <Link
                href={FORM}
                className="inline-flex min-h-14 items-center justify-center gap-2 border border-white/20 px-8 text-[13px] font-medium tracking-[0.08em] text-white transition hover:border-[#F4C430] hover:text-[#F4C430]"
              >
                Apply as a partner
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-4 text-xs tracking-[0.04em] text-white/45">
              Choose Fleet Partner Investment on the form. We confirm terms in writing.
            </p>
          </div>

          <aside className="relative isolate min-h-[280px] overflow-hidden rounded-[28px]">
            <HomeImg
              src={BRAND.yard}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B16] via-[#0B1B16]/55 to-transparent" />
            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Invest</p>
              <p className="font-display mt-2 text-3xl font-medium leading-tight">
                Put your capital on India&apos;s yellow EV fleet
              </p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                One PDF. The full partnership story. Then apply on the form below.
              </p>
              <a
                href={FLEET_INVESTMENT.pdfHref}
                download={FLEET_INVESTMENT.pdfFileName}
                className="mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#0B1B16]"
              >
                <Download size={16} />
                Download PDF
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border-t border-white/10 pt-5">
                <Icon size={18} strokeWidth={1.5} className="text-[#F4C430]" />
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
