"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";

export default function InvestHomeInvite() {
  return (
    <section className="bg-[#07130F] py-14 text-white sm:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-8 border-y border-white/10 py-10 sm:grid-cols-[1fr_auto] sm:py-12">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#A8E6C3]">
              Fleet partner
            </p>
            <h3 className="font-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Grow the yellow fleet.
              <span className="italic text-[#F4C430]"> We run every ride.</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
              Download the official partnership brief, then apply. No calculators on this page —
              the numbers live in the PDF, the way modern EV brands share a deck.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={FLEET_INVESTMENT.pdfHref}
              download={FLEET_INVESTMENT.pdfFileName}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#F4C430] px-7 text-[13px] font-medium tracking-[0.08em] text-[#07130F]"
            >
              <Download size={16} />
              Download PDF
            </a>
            <Link
              href={FLEET_INVESTMENT.pageHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-7 text-[13px] font-medium tracking-[0.08em] text-white"
            >
              Open Invest
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
