"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type ServiceCardProps = {
  icon?: string;
  title: string;
  description: string;
  color?: string;
  image?: string;
  link?: string;
  badge?: string;
  stat?: string;
  tags?: string[];
};

export default function ServiceCard({
  title,
  description,
  image,
  link = "/ride-options",
  badge,
  tags = [],
}: ServiceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[36px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#18B368] via-[#4ADE80] to-[#EC2A8C]" />
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#18B368]/12 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-[#EC2A8C]/10 blur-[80px]" />

      <div className="relative grid items-center gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-14">
        <div>
          {badge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#18B368]">
              <span className="h-2 w-2 rounded-full bg-[#18B368]" />
              {badge}
            </span>
          ) : null}

          <h3 className="mt-5 text-3xl font-black leading-[0.95] tracking-[-0.04em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            <span className="block text-[#18B368]">EVUDDY</span>
            <span className="mt-1 block bg-gradient-to-r from-[#16C45B] to-[#EC2A8C] bg-clip-text text-transparent">
              {title.replace(/^EVUDDY\s+/i, "")}
            </span>
          </h3>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg sm:leading-8">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={link} className="w-full sm:w-auto">
              <span className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#18B368] to-[#13A657] px-7 py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.32)] transition hover:-translate-y-0.5 sm:w-auto">
                Reserve Your EV
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 text-base font-bold text-[#0F172A] transition hover:border-[#18B368] hover:text-[#18B368] sm:w-auto">
                Book a scooter
              </span>
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[240px] items-end justify-center sm:min-h-[340px]">
          <div className="absolute h-56 w-56 rounded-full bg-[#18B368]/15 blur-[80px] sm:h-80 sm:w-80" />
          {image ? (
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Image
                src={image}
                alt={title}
                width={960}
                height={600}
                className="w-[260px] rounded-[22px] object-cover shadow-[0_24px_50px_rgba(15,23,42,0.22)] sm:w-[380px] sm:rounded-[28px] lg:w-[480px]"
              />
            </motion.div>
          ) : null}

          <div className="absolute left-0 top-4 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur sm:left-4 sm:px-4 sm:py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Range</p>
            <p className="text-lg font-black text-[#18B368] sm:text-2xl">120 KM</p>
          </div>
          <div className="absolute bottom-6 right-0 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur sm:right-4 sm:px-4 sm:py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Speed</p>
            <p className="text-lg font-black text-[#EC2A8C] sm:text-2xl">45 km/h</p>
          </div>
        </div>
      </div>
    </article>
  );
}
