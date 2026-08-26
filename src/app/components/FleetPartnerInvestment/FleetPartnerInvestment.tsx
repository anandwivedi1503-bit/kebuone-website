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

const steps = [
  {
    icon: HandCoins,
    title: "You invest",
    text: "Join the Fleet Partner Investment programme with a transparent, fixed model.",
  },
  {
    icon: Bike,
    title: "EVUDDY deploys scooters",
    text: "We provide 3 electric scooters per ₹1 lakh, rented at ₹230 / 24 hrs.",
  },
  {
    icon: TrendingUp,
    title: "Profit after expenses",
    text: "₹87 profit is generated per scooter after all operating expenses.",
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

type Props = {
  ctaHref?: string;
};

export default function FleetPartnerInvestment({
  ctaHref = "/partners#partner-form",
}: Props) {
  return (
    <section
      id="fleet-investment"
      className="relative overflow-hidden bg-[#F4FBF7] py-16 sm:py-24 scroll-mt-28"
    >
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/25 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-[#0F172A]">
              <span className="h-2 w-2 rounded-full bg-[#18B368]" />
              FLEET PARTNER INVESTMENT
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-[3.4rem]">
              Invest in clean mobility.{" "}
              <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                Smart rides. Bright future.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-lg">
              A published 42-month plan: EVUDDY runs the fleet, you share profit 50/50.
              Connect through the partners form — we will walk you through payouts and paperwork.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={ctaHref}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 font-bold text-white shadow-[0_12px_28px_rgba(24,179,104,0.28)] transition hover:bg-[#14a05c]"
              >
                Connect as an investor
                <ArrowRight size={18} />
              </Link>
              <p className="self-center text-sm text-slate-500">
                Choose Fleet Partner on the form. No payment on this page.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[28px] border border-[#18B368]/15 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          >
            <Image
              src="/evuddy-scooter-cutout.png"
              alt="EVUDDY electric scooter for fleet partners"
              width={720}
              height={480}
              className="mx-auto h-auto w-full max-h-[340px] object-contain p-6"
            />
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18B368] text-white">
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-xs font-bold tracking-[0.14em] text-[#EC2A8C]">
                  0{index + 1}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#0F172A]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] bg-[#0A3D32] text-white">
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-center lg:p-6">
            <p className="text-center text-sm font-semibold sm:text-left">
              3 scooters
            </p>
            <p className="text-center text-sm font-semibold">
              × ₹43.5 investor share / scooter
            </p>
            <p className="text-center text-sm font-semibold">× 30 days</p>
            <p className="rounded-2xl bg-[#EC2A8C] px-4 py-3 text-center text-base font-black">
              = ₹3,915 investor share / month
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#18B368]/20 bg-white p-5">
            <CalendarDays className="text-[#18B368]" size={26} />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tenure</p>
            <p className="mt-1 text-2xl font-black text-[#0F172A]">42 months</p>
          </div>
          <div className="rounded-[24px] border border-[#18B368]/20 bg-white p-5">
            <Coins className="text-[#18B368]" size={26} />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Scrap after 42 months</p>
            <p className="mt-1 text-2xl font-black text-[#0F172A]">₹6,000 / scooter</p>
            <p className="mt-1 text-sm text-slate-500">3 scooters = ₹18,000</p>
          </div>
          <div className="rounded-[24px] border border-[#EC2A8C]/20 bg-white p-5">
            <Wallet className="text-[#EC2A8C]" size={26} />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Total to investor</p>
            <p className="mt-1 text-2xl font-black text-[#0F172A]">₹1,82,430</p>
            <p className="mt-1 text-sm text-slate-500">On the ₹1 lakh / 3-scooter plan</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">
            Investment plan options
          </h3>
          <p className="mt-2 text-slate-500">Same model. Choose the scale that fits you.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.amount}
              className={`flex flex-col overflow-hidden rounded-[28px] border transition duration-200 hover:-translate-y-1 ${
                plan.featured
                  ? "border-[#EC2A8C] bg-[#EC2A8C] text-white shadow-[0_20px_50px_rgba(236,42,140,0.28)]"
                  : "border-[#18B368]/20 bg-white text-[#0F172A] hover:border-[#18B368] hover:shadow-[0_16px_40px_rgba(24,179,104,0.14)]"
              }`}
            >
              <div className={`px-6 py-5 ${plan.featured ? "bg-[#d01878]" : "bg-[#0A3D32] text-white"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">Investment amount</p>
                <p className="mt-1 text-3xl font-black">{plan.amount}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 px-6 py-5 text-sm">
                <p><span className="font-semibold">Scooters provided:</span> {plan.scooters}</p>
                <p><span className="font-semibold">Monthly share:</span> {plan.monthly}</p>
                <p><span className="font-semibold">Tenure:</span> 42 months</p>
                <p><span className="font-semibold">Scrap after 42 months:</span> {plan.scrap}</p>
                <p className={`mt-auto rounded-2xl px-4 py-3 text-center font-black ${plan.featured ? "bg-white/15" : "bg-[#18B368]/10 text-[#0A3D32]"}`}>
                  Total after 42 months: {plan.total}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                <Icon className="text-[#18B368]" size={26} />
                <h4 className="mt-3 font-bold text-[#0F172A]">{item.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-[#18B368]/15 bg-white p-3 sm:p-4">
          <p className="px-2 pb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Official Fleet Partner Investment poster
          </p>
          <Image
            src="/fleet-partner-poster.jpg"
            alt="EVUDDY Fleet Partner Investment poster with plans and returns"
            width={1600}
            height={900}
            className="h-auto w-full rounded-2xl"
          />
        </div>

        <div className="mt-12 overflow-hidden rounded-[28px] bg-[#0A1134] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">
                Invest today. Drive tomorrow.
              </p>
              <h3 className="mt-2 max-w-2xl text-2xl font-black sm:text-4xl">
                Be a partner in our journey towards a greener future.
              </h3>
              <p className="mt-3 max-w-xl text-sm text-white/70">
                Figures follow EVUDDY’s Fleet Partner Investment model. We confirm operations, payouts and documents when you apply — no investment is taken on this website.
              </p>
            </div>
            <Link
              href={ctaHref}
              className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-[#EC2A8C] px-8 font-bold text-white transition hover:bg-[#d01878]"
            >
              Apply on partners form
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
