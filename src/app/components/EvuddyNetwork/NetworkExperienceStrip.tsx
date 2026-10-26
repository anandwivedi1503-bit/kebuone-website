"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BatteryCharging,
  Clock,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Smartphone,
    title: "Book in minutes",
    text: "OTP login, pick city & hub, pay on Book EV.",
    href: "/ride-options",
  },
  {
    icon: ShieldCheck,
    title: "Yard pickup OTP",
    text: "Scooter unlocks only after verified payment at the hub.",
    href: "/ride-options",
  },
  {
    icon: MapPinned,
    title: "Live GPS ride",
    text: "Same IoT feed ops use — hub to hub on the yellow fleet.",
    href: "/ride-options",
  },
  {
    icon: Clock,
    title: "Flexible plans",
    text: "Hourly, daily, weekly, monthly or Rent to Own.",
    href: "/ride-options",
  },
  {
    icon: BatteryCharging,
    title: "Charge at hub",
    text: "Return to your pickup yard — swap & charge on site.",
    href: "/contact",
  },
  {
    icon: Wallet,
    title: "Wallet & receipts",
    text: "Razorpay, wallet balance and GST invoices on every ride.",
    href: "/ride-options",
  },
] as const;

export default function NetworkExperienceStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1F6B4A]">
        Rider experience
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5C635E] sm:text-[15px]">
        Built like modern mobility apps — fast booking, verified pickup, and clear pricing. No
        data changes; this is how EVUDDY already works on Book EV.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
            >
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-2xl border border-[#E4DDD2] bg-white p-4 transition hover:border-[#1F6B4A]/35 hover:shadow-[0_16px_40px_rgba(31,107,74,0.1)] sm:p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3EC] text-[#1F6B4A] transition group-hover:bg-[#1F6B4A] group-hover:text-white">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <p className="mt-4 text-sm font-semibold text-[#1C1917]">{item.title}</p>
                <p className="mt-1.5 flex-1 text-xs leading-5 text-[#6B736E] sm:text-sm sm:leading-6">
                  {item.text}
                </p>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F6B4A] opacity-0 transition group-hover:opacity-100">
                  Learn more →
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
