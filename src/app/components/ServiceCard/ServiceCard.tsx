"use client";

import Link from "next/link";
import Image from "next/image";
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
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        {badge ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            {badge}
          </p>
        ) : null}

        <h3 className="font-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          <span className="block">{title.startsWith("EVUDDY") ? "EVUDDY" : ""}</span>
          <span className="block italic text-[#1F6B4A]">
            {title.replace(/^EVUDDY\s+/i, "")}
          </span>
        </h3>

        <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#5C635E]">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A847A]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={link} className="w-full sm:w-auto">
            <span className="inline-flex h-12 w-full items-center justify-center gap-2 bg-[#1F6B4A] px-7 text-[13px] font-medium tracking-[0.08em] text-white transition hover:bg-[#18573c] sm:w-auto">
              Reserve Your EV
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/ride-options" className="w-full sm:w-auto">
            <span className="inline-flex h-12 w-full items-center justify-center border border-[#1C1917]/15 px-7 text-[13px] font-medium tracking-[0.06em] text-[#1C1917] sm:w-auto">
              Book a scooter
            </span>
          </Link>
        </div>
      </div>

      <div className="relative">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={960}
            height={720}
            className="h-auto w-full object-contain"
          />
        ) : null}
        <div className="mt-4 flex justify-between text-[11px] uppercase tracking-[0.18em] text-[#8A847A]">
          <span>Range 120 KM</span>
          <span>Speed 45 km/h</span>
        </div>
      </div>
    </article>
  );
}
