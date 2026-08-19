"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Leaf,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const CEO_BIO =
  "As the CEO & Founder of Shubhrax Mobility Ltd, Sunil Pathak is the driving force behind the company's vision of transforming smart electric mobility. With a strong focus on innovation, customer satisfaction, and sustainable growth, he has led Evuddy towards becoming a trusted name in the mobility sector. His leadership is driven by a commitment to excellence, empowering teams, and embracing technology to deliver reliable and eco-friendly mobility solutions. Through his vision and dedication, Sunil continues to inspire progress, create lasting impact, and shape a future-ready organization.";

const values = [
  {
    icon: BadgeCheck,
    title: "Integrity",
    text: "Honest decisions, transparent operations, and accountability on every ride.",
  },
  {
    icon: Zap,
    title: "Innovation",
    text: "OTP, live tracking and Rent to Own — technology that makes EV riding simple.",
  },
  {
    icon: Users,
    title: "Customer first",
    text: "Every hub, booking and support flow starts with the rider experience.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    text: "Electric scooters for daily commute, delivery and ownership without extra noise.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function Leadership() {
  return (
    <div className="bg-[#F4FBF7] text-[#08112F]">
      <section className="relative overflow-hidden">
        <Image
          src="/poster.png"
          alt="EVUDDY electric scooters on city roads"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.72)_0%,rgba(7,17,31,0.5)_45%,rgba(7,17,31,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(24,179,104,0.28),transparent_34%)]" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-36 sm:px-6 sm:pb-20 lg:px-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.7 }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-[0.22em] text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#6EE7A8]" />
              LEADERSHIP
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Meet the founder
              <span className="block bg-gradient-to-r from-[#6EE7A8] via-white to-[#FF8FBF] bg-clip-text text-transparent">
                driving EVUDDY.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Smart · Electric · Mobility. Leadership with a clear brief: make
              every ride safe, simple and electric.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="founder" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(24,179,104,0.12),transparent_32%),radial-gradient(circle_at_100%_8%,rgba(236,42,140,0.08),transparent_28%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-3 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#18B368]">
              Founder &amp; CEO
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
              Sunil Pathak
            </h2>
            <p className="max-w-2xl text-lg text-slate-600">
              Founder &amp; CEO, Shubhrax Mobility Ltd
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fade}
            transition={{ duration: 0.6 }}
            className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12"
          >
            <figure className="overflow-hidden rounded-[32px] bg-white p-3 shadow-[0_40px_120px_rgba(8,17,47,0.14)] ring-1 ring-[#18B368]/10">
              <Image
                src="/leadership/ceo-poster.png"
                alt="Sunil Pathak, Founder and CEO of EVUDDY by Shubhrax Mobility Ltd"
                width={1024}
                height={1365}
                className="h-auto w-full rounded-[24px] object-cover"
                priority
              />
            </figure>

            <div className="flex flex-col justify-center">
              <div className="rounded-[32px] bg-[#08112F] p-7 text-white shadow-[0_30px_80px_rgba(8,17,47,0.18)] sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6EE7A8]">
                  Profile
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  Meet the Founder &amp; CEO
                </h3>
                <p className="mt-6 text-sm leading-7 text-white/88 sm:text-base sm:leading-8">
                  {CEO_BIO}
                </p>
                <div className="mt-8 rounded-2xl bg-[#18B368] px-5 py-3 text-center">
                  <p className="text-sm font-black tracking-wide">#safeRideWithEvuddy</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Company", "Shubhrax Mobility Ltd"],
                  ["Brand", "EVUDDY"],
                  ["Focus", "Smart EV mobility"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-white bg-white p-5 shadow-[0_16px_40px_rgba(8,17,47,0.06)]"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
                      {label}
                    </p>
                    <p className="mt-2 font-bold text-[#08112F]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">Our values</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            The principles behind every EVUDDY ride
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-[28px] border border-slate-100 bg-[#F7FBFA] p-7 transition hover:-translate-y-1 hover:border-[#18B368]/25 hover:bg-white hover:shadow-[0_24px_60px_rgba(24,179,104,0.12)]"
              >
                <value.icon className="h-8 w-8 text-[#18B368]" />
                <h3 className="mt-5 text-2xl font-black">{value.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#08112F] px-8 py-14 text-white sm:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6EE7A8]">
            Join the team
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            Build electric mobility with EVUDDY
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            We are hiring people who care about riders, cities and clean transport.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-full bg-[#18B368] px-6 py-3 font-bold text-white"
            >
              View careers <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white"
            >
              About EVUDDY
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
