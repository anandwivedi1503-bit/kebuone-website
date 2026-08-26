"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  Coins,
  Expand,
  HandCoins,
  Leaf,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

const FORM = "/partners#partner-form";
const POSTER_SRC = "/fleet-partner-poster.jpg";
const POSTER_ALT =
  "EVUDDY Fleet Partner Investment poster showing plans, 50/50 profit share and 42-month returns";

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
    label: "Starter",
    amount: "₹1,00,000",
    scooters: "3 scooters",
    monthly: "₹3,915",
    scrap: "₹18,000",
    total: "₹1,82,430",
    featured: false,
  },
  {
    label: "Pro",
    amount: "₹5,00,000",
    scooters: "15 scooters",
    monthly: "₹19,575",
    scrap: "₹90,000",
    total: "₹9,12,150",
    featured: true,
  },
  {
    label: "Enterprise",
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
  posterPriority?: boolean;
};

export default function FleetPartnerInvestment({ posterPriority = false }: Props) {
  const [posterOpen, setPosterOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (posterOpen && !dialog.open) dialog.showModal();
    if (!posterOpen && dialog.open) dialog.close();
  }, [posterOpen]);

  return (
    <section
      id="fleet-investment"
      className="relative scroll-mt-36 bg-[#F4FBF7] py-14 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#18B368]/12 blur-[110px]" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-[#EC2A8C]/8 blur-[100px]" />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center lg:gap-12">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/25 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-[#0F172A]">
              <span className="h-2 w-2 rounded-full bg-[#18B368]" />
              FLEET PARTNER INVESTMENT
            </span>
            <h2 className="mt-5 text-balance text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
              Invest in clean mobility.{" "}
              <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                Smart rides. Bright future.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600 sm:text-lg">
              A published 42-month plan. EVUDDY runs the fleet. You share profit 50/50.
              Read the model here, then apply on the partners form. No payment on this site.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={FORM}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 text-base font-bold text-white shadow-[0_12px_28px_rgba(24,179,104,0.28)] transition hover:bg-[#14a05c]"
              >
                Apply on partners form
                <ArrowRight size={18} />
              </Link>
              <a
                href="#investment-plans"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-[#18B368] hover:text-[#18B368]"
              >
                See plans
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Choose Fleet Partner Investment on the form. We confirm payouts and paperwork.
            </p>
          </div>

          <div className="order-1 mx-auto w-full max-w-[420px] lg:order-2">
            <button
              type="button"
              onClick={() => setPosterOpen(true)}
              className="group relative block w-full rounded-[28px] border border-white bg-white p-2 text-left shadow-[0_24px_60px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(24,179,104,0.18)]"
            >
              <span className="pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0F172A] shadow-sm">
                <Expand size={12} />
                View poster
              </span>
              <img
                src={POSTER_SRC}
                alt={POSTER_ALT}
                width={1024}
                height={1536}
                decoding="async"
                fetchPriority={posterPriority ? "high" : "auto"}
                className="h-auto w-full rounded-[22px] object-contain object-top"
              />
            </button>
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Official EVUDDY investment poster
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18B368] text-white">
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-[11px] font-bold tracking-[0.16em] text-[#EC2A8C]">0{index + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-[#0F172A]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
            <p className="flex items-center justify-center px-4 py-4 text-center text-sm font-semibold text-[#0F172A] sm:text-left lg:justify-start lg:px-6">
              3 scooters
            </p>
            <p className="flex items-center justify-center bg-[#F7FBF8] px-4 py-4 text-center text-sm font-semibold text-[#0F172A]">
              × ₹43.5 share / scooter
            </p>
            <p className="flex items-center justify-center px-4 py-4 text-center text-sm font-semibold text-[#0F172A]">
              × 30 days
            </p>
            <p className="flex items-center justify-center bg-[#EC2A8C] px-4 py-4 text-center text-sm font-black text-white sm:text-base">
              = ₹3,915 / month
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-white bg-white p-5 shadow-sm">
            <CalendarDays className="text-[#18B368]" size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Tenure</p>
            <p className="mt-1 text-2xl font-black text-[#0F172A]">42 months</p>
          </div>
          <div className="rounded-[22px] border border-white bg-white p-5 shadow-sm">
            <Coins className="text-[#18B368]" size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Scrap after 42 months</p>
            <p className="mt-1 text-2xl font-black text-[#0F172A]">₹6,000 / scooter</p>
            <p className="mt-1 text-sm text-slate-500">3 scooters = ₹18,000</p>
          </div>
          <div className="rounded-[22px] border border-[#18B368]/20 bg-[#18B368] p-5 text-white shadow-sm">
            <Wallet size={24} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">₹1 lakh plan total</p>
            <p className="mt-1 text-2xl font-black">₹1,82,430</p>
          </div>
        </div>

        <div id="investment-plans" className="mt-12 scroll-mt-36 text-center">
          <h3 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">
            Choose a plan. Apply when you are ready.
          </h3>
          <p className="mt-2 text-slate-500">Same model at every scale. We confirm details on the form.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.amount}
              className={`relative flex flex-col overflow-hidden rounded-[28px] border bg-white ${
                plan.featured
                  ? "border-[#18B368] shadow-[0_24px_60px_rgba(24,179,104,0.18)] lg:-translate-y-2"
                  : "border-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
              }`}
            >
              {plan.featured ? (
                <p className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#18B368]">
                  Most chosen
                </p>
              ) : null}
              <div className={`px-6 py-5 ${plan.featured ? "bg-[#18B368] text-white" : "bg-[#0A1134] text-white"}`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-80">{plan.label}</p>
                <p className="mt-1 text-3xl font-black">{plan.amount}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 px-6 py-5 text-sm text-slate-600">
                <p><span className="font-semibold text-[#0F172A]">Scooters:</span> {plan.scooters}</p>
                <p><span className="font-semibold text-[#0F172A]">Monthly share:</span> {plan.monthly}</p>
                <p><span className="font-semibold text-[#0F172A]">Tenure:</span> 42 months</p>
                <p><span className="font-semibold text-[#0F172A]">Scrap:</span> {plan.scrap}</p>
                <p className="mt-1 rounded-2xl bg-[#18B368]/10 px-4 py-3 text-center font-black text-[#0A3D32]">
                  Total after 42 months: {plan.total}
                </p>
                <Link
                  href={FORM}
                  className={`mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-bold text-white transition ${
                    plan.featured ? "bg-[#18B368] hover:bg-[#14a05c]" : "bg-[#0A1134] hover:bg-[#151d4a]"
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
              <div key={item.title} className="rounded-[22px] border border-white bg-white p-5 shadow-sm">
                <Icon className="text-[#18B368]" size={24} />
                <h4 className="mt-3 font-bold text-[#0F172A]">{item.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-[#18B368]/20 bg-white px-6 py-7 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">Invest today. Drive tomorrow.</p>
            <h3 className="mt-1 text-xl font-black text-[#0F172A] sm:text-2xl">
              Let’s build smart electric mobility together.
            </h3>
          </div>
          <Link
            href={FORM}
            className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-[#18B368] px-8 font-bold text-white shadow-[0_12px_28px_rgba(24,179,104,0.28)] transition hover:bg-[#14a05c]"
          >
            Open partners form
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setPosterOpen(false)}
        className="fixed inset-0 z-[1000] m-0 h-full max-h-none w-full max-w-none bg-black/70 p-0 backdrop:bg-black/70 open:flex open:items-center open:justify-center"
      >
        <div className="relative mx-auto max-h-[96vh] w-[min(96vw,720px)] overflow-y-auto rounded-[24px] bg-white p-3 shadow-2xl">
          <button
            type="button"
            onClick={() => setPosterOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A] text-white"
            aria-label="Close poster"
          >
            <X size={18} />
          </button>
          <img
            src={POSTER_SRC}
            alt={POSTER_ALT}
            width={1024}
            height={1536}
            className="h-auto w-full rounded-[18px] object-contain"
          />
        </div>
      </dialog>
    </section>
  );
}
