"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  Coins,
  HandCoins,
  Leaf,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const FORM = "/partners#partner-form";

const steps = [
  {
    icon: HandCoins,
    title: "You invest",
    text: "Join Fleet Partner Investment with a transparent, fixed model.",
  },
  {
    icon: Bike,
    title: "We deploy scooters",
    text: "3 electric scooters per ₹1 lakh, rented at ₹230 / 24 hrs.",
  },
  {
    icon: TrendingUp,
    title: "Profit after expenses",
    text: "₹87 profit per scooter after operations and maintenance.",
  },
  {
    icon: Users,
    title: "50 / 50 share",
    text: "Company and investor split equally — ₹43.5 each per scooter, per day.",
  },
];

const plans = [
  {
    amount: "₹1,00,000",
    scooters: "3 scooters",
    monthly: "₹3,915",
    scrap: "₹18,000",
    total: "₹1,82,430",
    featured: false,
  },
  {
    amount: "₹5,00,000",
    scooters: "15 scooters",
    monthly: "₹19,575",
    scrap: "₹90,000",
    total: "₹9,12,150",
    featured: true,
  },
  {
    amount: "₹10,00,000",
    scooters: "30 scooters",
    monthly: "₹39,150",
    scrap: "₹1,80,000",
    total: "₹18,24,300",
    featured: false,
  },
];

const reasons = [
  { icon: ShieldCheck, title: "Assured returns", text: "Transparent and fixed model, published up front." },
  { icon: Bike, title: "Growing market", text: "High demand for EV rentals in Indian cities." },
  { icon: Settings, title: "End-to-end management", text: "Operations, maintenance and marketing by EVUDDY." },
  { icon: Leaf, title: "Sustainable impact", text: "Support clean, green mobility while you earn." },
];

export default function FleetPartnerInvestment() {
  return (
    <section
      id="fleet-investment"
      className="relative overflow-hidden bg-[#071410] py-14 text-white sm:py-20 lg:py-24 scroll-mt-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18B368] to-transparent" />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/40 bg-[#18B368]/10 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-[#7dffc0]">
              FLEET PARTNER INVESTMENT
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
              Invest in clean mobility.
              <span className="mt-2 block bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                Smart rides. Bright future.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/70 sm:text-lg">
              A 42-month published plan. EVUDDY runs the fleet. You share profit 50/50.
              Apply on the partners form — we confirm payouts and paperwork. No payment on this site.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={FORM}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#EC2A8C] px-8 text-base font-bold text-white shadow-[0_14px_36px_rgba(236,42,140,0.4)] transition hover:bg-[#d01878]"
              >
                Invest — open partners form
                <ArrowRight size={18} />
              </Link>
              <Link
                href={FORM}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white/90 transition hover:border-[#18B368] hover:text-[#7dffc0]"
              >
                Talk to EVUDDY
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          >
            <Image
              src="/evuddy-scooter-cutout.png"
              alt="EVUDDY electric scooter for fleet partners"
              width={720}
              height={480}
              className="mx-auto h-auto w-full max-h-[300px] object-contain p-6 sm:max-h-[360px]"
            />
          </motion.div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18B368] text-[#071410]">
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-[11px] font-bold tracking-[0.16em] text-[#EC2A8C]">0{index + 1}</p>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{step.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-[24px] bg-gradient-to-r from-[#0A3D32] to-[#0d4d40] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
            <p className="text-center text-sm font-semibold sm:text-left">3 scooters</p>
            <p className="text-center text-sm font-semibold">× ₹43.5 share / scooter</p>
            <p className="text-center text-sm font-semibold">× 30 days</p>
            <Link
              href={FORM}
              className="rounded-2xl bg-[#EC2A8C] px-4 py-3 text-center text-sm font-black transition hover:bg-[#d01878] sm:text-base"
            >
              = ₹3,915 / month — apply
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5">
            <CalendarDays className="text-[#18B368]" size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Tenure</p>
            <p className="mt-1 text-2xl font-black">42 months</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5">
            <Coins className="text-[#18B368]" size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Scrap after 42 months</p>
            <p className="mt-1 text-2xl font-black">₹6,000 / scooter</p>
            <p className="mt-1 text-sm text-white/55">3 scooters = ₹18,000</p>
          </div>
          <div className="rounded-[22px] border border-[#EC2A8C]/30 bg-[#EC2A8C]/10 p-5">
            <Wallet className="text-[#EC2A8C]" size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">₹1 lakh plan total</p>
            <p className="mt-1 text-2xl font-black">₹1,82,430</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-black tracking-tight sm:text-3xl">Choose a plan. Apply in one tap.</h3>
          <p className="mt-2 text-white/60">Same model at every scale. We will confirm details on the form.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.amount}
              className={`flex flex-col overflow-hidden rounded-[28px] border ${
                plan.featured
                  ? "border-[#EC2A8C] bg-[#EC2A8C] shadow-[0_24px_60px_rgba(236,42,140,0.35)] lg:-translate-y-2"
                  : "border-white/10 bg-white text-[#0F172A]"
              }`}
            >
              <div className={`px-6 py-5 ${plan.featured ? "bg-[#c4126e]" : "bg-[#0A3D32] text-white"}`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-80">Investment</p>
                <p className="mt-1 text-3xl font-black">{plan.amount}</p>
              </div>
              <div className={`flex flex-1 flex-col gap-2.5 px-6 py-5 text-sm ${plan.featured ? "text-white" : ""}`}>
                <p><span className="font-semibold">Scooters:</span> {plan.scooters}</p>
                <p><span className="font-semibold">Monthly share:</span> {plan.monthly}</p>
                <p><span className="font-semibold">Tenure:</span> 42 months</p>
                <p><span className="font-semibold">Scrap:</span> {plan.scrap}</p>
                <p className={`mt-1 rounded-2xl px-4 py-3 text-center font-black ${plan.featured ? "bg-white/15" : "bg-[#18B368]/10 text-[#0A3D32]"}`}>
                  Total after 42 months: {plan.total}
                </p>
                <Link
                  href={FORM}
                  className={`mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-bold transition ${
                    plan.featured
                      ? "bg-white text-[#EC2A8C] hover:bg-[#fff5fa]"
                      : "bg-[#18B368] text-white hover:bg-[#14a05c]"
                  }`}
                >
                  Apply on partners form
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5">
                <Icon className="text-[#18B368]" size={24} />
                <h4 className="mt-3 font-bold">{item.title}</h4>
                <p className="mt-1 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-[24px] border border-white/10 bg-white p-2 sm:p-3">
          <p className="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Official investment poster
          </p>
          <Image
            src="/fleet-partner-poster.jpg"
            alt="EVUDDY Fleet Partner Investment poster with plans and returns"
            width={1600}
            height={900}
            className="h-auto w-full rounded-2xl"
          />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-[#18B368]/30 bg-[#18B368]/10 px-6 py-7 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7dffc0]">Invest today. Drive tomorrow.</p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">Let’s build smart electric mobility together.</h3>
          </div>
          <Link
            href={FORM}
            className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-[#EC2A8C] px-8 font-bold text-white transition hover:bg-[#d01878]"
          >
            Open partners form
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
