"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BatteryCharging,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const highlights = [
  "Zero emissions",
  "120 km certified range",
  "Live GPS tracking",
  "Fast charging",
];

const stats = [
  {
    label: "Range",
    value: "120 KM",
    hint: "Single charge",
    icon: BatteryCharging,
  },
  {
    label: "Charge",
    value: "Fast",
    hint: "Quick top-up",
    icon: Zap,
  },
  {
    label: "Tracking",
    value: "GPS Live",
    hint: "Always connected",
    icon: MapPinned,
  },
  {
    label: "Safety",
    value: "Insured",
    hint: "Secure rides",
    icon: ShieldCheck,
  },
];

const audiences = [
  "Daily commuters",
  "Businesses",
  "Fleet operators",
  "Delivery partners",
  "Gig workers",
];

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#F7FBFA]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(24,179,104,0.14),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(236,42,140,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-10 lg:pb-20 lg:pt-36">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/15 bg-white px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <span className="h-2 w-2 rounded-full bg-[#18B368]" />
              <Sparkles className="h-4 w-4 text-[#18B368]" />
              <span className="text-[11px] font-bold tracking-[0.16em] text-slate-600">
                INDIA&apos;S SMART ELECTRIC MOBILITY
              </span>
            </motion.div>

            <h1 className="mt-6 text-[2.5rem] font-black leading-[0.92] tracking-[-0.06em] text-[#0F172A] sm:text-6xl lg:text-7xl">
              Move smarter.
              <span className="mt-2 block text-[#18B368]">Ride electric.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg lg:mx-0">
              Book an EVUDDY scooter in minutes. Clean city rides, live tracking,
              and a premium electric experience built for India.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/ride-options" className="w-full sm:w-auto">
                <span className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 text-base font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)] sm:h-16 sm:px-10">
                  Reserve Your EV
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link href="/partners" className="w-full sm:w-auto">
                <span className="inline-flex h-14 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-[#18B368] sm:h-16 sm:px-10">
                  Become a Partner
                </span>
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Already registered?{" "}
              <Link
                href="/ride-options"
                className="font-bold text-[#18B368] underline-offset-4 hover:underline"
              >
                Book a scooter
              </Link>
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400">EVUDDY</span>
                <span className="rounded-full bg-[#18B368] px-3 py-1 text-[11px] font-bold text-white">
                  Live in city
                </span>
              </div>
              <Image
                src="/poster.png"
                alt="EVUDDY electric scooter"
                width={1600}
                height={1200}
                priority
                className="h-[260px] w-full object-cover sm:h-[400px] lg:h-[480px]"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-white bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  >
                    <Icon className="mb-2 h-4 w-4 text-[#18B368]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl font-black text-[#0F172A] sm:text-2xl">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.hint}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Built for</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {audiences.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
