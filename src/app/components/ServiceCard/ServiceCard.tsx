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
  tags = [],
}: ServiceCardProps) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <h3 className="ev-display text-4xl leading-[0.95] text-[#0F172A] sm:text-6xl">
          EVUDDY
          <span className="mt-2 block italic text-[#18B368]">
            {title.replace(/^EVUDDY\s+/i, "")}
          </span>
        </h3>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {tags.map((tag) => (
            <span key={tag} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0F172A]/55">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={link} className="ev-cta w-full sm:w-auto">
            Reserve Your EV
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/ride-options" className="ev-cta-dark w-full sm:w-auto">
            Book a scooter
          </Link>
        </div>
      </div>

      <div className="relative flex min-h-[280px] items-end justify-center overflow-hidden bg-[#F7FBFA] px-6 py-10 sm:min-h-[420px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(24,179,104,0.18),transparent_55%)]" />
        {image ? (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Image
              src={image}
              alt={title}
              width={720}
              height={720}
              className="w-[240px] object-contain sm:w-[360px] lg:w-[440px]"
            />
          </motion.div>
        ) : null}
      </div>
    </article>
  );
}
