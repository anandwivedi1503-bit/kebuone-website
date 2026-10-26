"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ExternalLink, Sparkles } from "lucide-react";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import HomeImg from "../HomeMedia/HomeImg";

export default function PartnerSpotlight() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="dealer-network" className="scroll-mt-36 bg-white py-16 sm:py-20">
      <div
        id="fleet-investment"
        className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Fleet partner investment
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Grow India&apos;s yellow EV fleet with{" "}
          <span className="italic text-[#1F6B4A]">EVUDDY</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5C635E]">
          Official investment brief — animated poster below. Open the full PDF in a new tab or
          download for your records. Apply on the partners form when you are ready.
        </p>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="group mt-10 overflow-hidden rounded-[32px] border border-[#E4DDD2] bg-gradient-to-br from-[#F7F4EE] via-white to-[#E8F3EC] shadow-[0_28px_80px_rgba(28,25,23,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative border-b border-[#E4DDD2] p-6 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#F4C430]/25 blur-3xl transition group-hover:bg-[#F4C430]/35" />
              <div className="flex items-center gap-2 text-[#1F6B4A]">
                <Sparkles size={18} strokeWidth={1.5} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Official poster
                </span>
              </div>
              <motion.div
                className="relative mt-6"
                whileHover={reduceMotion ? undefined : { scale: 1.02, rotate: -0.4 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#1F6B4A]/15 via-transparent to-[#EC2A8C]/10 opacity-80" />
                <HomeImg
                  src={FLEET_INVESTMENT.posterSrc}
                  alt="EVUDDY fleet partner investment brief"
                  className="relative w-full rounded-2xl border border-[#E4DDD2] object-contain shadow-[0_20px_50px_rgba(28,25,23,0.12)]"
                />
              </motion.div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B736E]">
                Investment brief
              </p>
              <p className="font-display mt-3 text-3xl font-medium leading-tight text-[#1C1917]">
                Fleet partner program
              </p>
              <p className="mt-4 text-[15px] leading-7 text-[#5C635E]">
                Put your capital on India&apos;s yellow EV fleet. EVUDDY operates hubs, riders,
                and software — partners grow the fleet behind the brand.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#5C635E]">
                {[
                  "Official PDF — full terms and story",
                  "No payment on this website",
                  "Apply on the partners form after you read the brief",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F6B4A]" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={FLEET_INVESTMENT.pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-6 text-[13px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c] hover:shadow-[0_12px_28px_rgba(31,107,74,0.28)]"
                >
                  <ExternalLink size={17} />
                  Open PDF
                </a>
                <a
                  href={FLEET_INVESTMENT.pdfHref}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#1C1917]/12 bg-white px-6 text-[13px] font-semibold tracking-[0.06em] text-[#1C1917] transition hover:border-[#1F6B4A]/40"
                >
                  <Download size={17} />
                  Download
                </a>
              </div>
              <Link
                href="/partners#partner-form"
                className="mt-4 inline-flex min-h-11 items-center justify-center text-[13px] font-semibold text-[#1F6B4A] underline-offset-4 hover:underline"
              >
                Apply as fleet partner →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
