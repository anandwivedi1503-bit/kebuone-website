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

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

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
    tone: "text-[#18B368] bg-[#18B368]/10",
  },
  {
    label: "Charge",
    value: "Fast",
    hint: "Quick top-up",
    icon: Zap,
    tone: "text-[#EC2A8C] bg-[#EC2A8C]/10",
  },
  {
    label: "Tracking",
    value: "GPS Live",
    hint: "Always connected",
    icon: MapPinned,
    tone: "text-[#18B368] bg-[#18B368]/10",
  },
  {
    label: "Safety",
    value: "Insured",
    hint: "Secure rides",
    icon: ShieldCheck,
    tone: "text-[#0F172A] bg-slate-100",
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
    <section
      id="home"
      className="relative overflow-hidden bg-[#F4FBF7]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(24,179,104,0.16),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(236,42,140,0.12),transparent_32%),linear-gradient(180deg,#F8FFF9_0%,#FFFFFF_48%,#FFF7FB_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#0F172A_1px,transparent_1px),linear-gradient(to_bottom,#0F172A_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto max-w-[1480px] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-20">
          <div className="text-center lg:text-left">
            <motion.div
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white/80 px-4 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:gap-3 sm:px-5"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#18B368]" />
              </span>
              <Sparkles className="h-4 w-4 text-[#18B368]" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-slate-700 sm:text-xs">
                INDIA&apos;S SMART ELECTRIC MOBILITY
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="show"
              custom={0.08}
              variants={fadeUp}
              className="mt-6 text-[2.35rem] font-black leading-[0.92] tracking-[-0.06em] text-[#0F172A] sm:mt-8 sm:text-6xl md:text-7xl xl:text-[88px]"
            >
              <span className="bg-gradient-to-r from-[#16C45B] via-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                Move smarter.
              </span>
              <br />
              Ride{" "}
              <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                electric.
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={0.16}
              variants={fadeUp}
              className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0"
            >
              Book an EVUDDY scooter in minutes. Clean city rides, live tracking,
              and a premium electric experience built for India.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.24}
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <span className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#18B368] via-[#16C45B] to-[#13A657] px-8 text-base font-bold text-white shadow-[0_22px_60px_rgba(24,179,104,0.38)] transition duration-300 hover:-translate-y-0.5 active:scale-[0.98] sm:h-16 sm:px-10 sm:text-lg">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Reserve Your EV
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>

              <Link href="/partners" className="w-full sm:w-auto">
                <span className="flex h-14 w-full items-center justify-center rounded-full border border-white bg-white/80 px-8 text-base font-bold text-[#18B368] shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white sm:h-16 sm:px-10 sm:text-lg">
                  Become a Partner
                </span>
              </Link>
            </motion.div>

            <p className="mt-4 text-sm text-slate-500">
              Already registered?{" "}
              <Link
                href="/book-bike"
                className="font-bold text-[#18B368] underline-offset-4 hover:underline"
              >
                Book a scooter
              </Link>
            </p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.32}
              variants={fadeUp}
              className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start"
            >
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur sm:text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#18B368]" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#18B368]/18 blur-[90px]" />
            <div className="pointer-events-none absolute -right-8 top-8 h-40 w-40 rounded-full bg-[#EC2A8C]/16 blur-[70px]" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 shadow-[0_40px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:rounded-[40px]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                  EVUDDY
                </span>
                <span className="rounded-full bg-[#18B368] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  Live in city
                </span>
              </div>

              <Image
                src="/poster.png"
                alt="EVUDDY electric scooter"
                width={1600}
                height={1200}
                priority
                className="h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/80 to-transparent" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
                    transition={{
                      duration: 5 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="rounded-[22px] border border-white/80 bg-white/85 p-3.5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5"
                  >
                    <div className={`mb-2 inline-flex rounded-2xl p-2 ${stat.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-xl font-black sm:text-2xl ${stat.tone.split(" ")[0]}`}>
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{stat.hint}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center sm:mt-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">
            Built for
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:mt-7 sm:gap-3">
            {audiences.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
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