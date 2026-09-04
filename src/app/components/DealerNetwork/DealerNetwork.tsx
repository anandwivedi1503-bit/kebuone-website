"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Network, Store } from "lucide-react";

import { dealerProgram } from "@/lib/dealerProgram";

type Props = {
  showApply?: boolean;
};

export default function DealerNetwork({ showApply = true }: Props) {
  return (
    <section
      id="dealer-network"
      className="relative scroll-mt-36 bg-[#F7F4EE] py-20 sm:scroll-mt-44 sm:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Trade partners
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Become our dealer{" "}
            <span className="italic text-[#1F6B4A]">&amp; distributor</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Two paths to grow EVUDDY in your city. Dealers sell and rent to riders.
            Distributors supply those dealers. Minimum investment is published up front —
            no hidden onboarding fees on this form.
          </p>
        </div>

        <a
          href="#dealer-roles"
          className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-[#1F6B4A]"
        >
          Scroll to roles
          <ArrowDown size={16} />
        </a>

        <div id="dealer-roles" className="mt-12 grid scroll-mt-36 gap-px bg-[#E4DDD2] sm:scroll-mt-44 lg:grid-cols-2">
          <article className="bg-[#FBF9F5] p-8 sm:p-10">
            <Store size={20} strokeWidth={1.5} className="text-[#1F6B4A]" />
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-[#5F6B63]">
              Dealer · retail
            </p>
            <h3 className="font-display mt-2 text-3xl font-medium text-[#1C1917]">
              EVUDDY Dealer
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#5C635E]">{dealerProgram.dealerRole}</p>
            <p className="mt-6 font-display text-2xl font-medium text-[#1C1917]">
              {dealerProgram.dealerMin}
              <span className="ml-2 text-base font-sans font-normal text-[#8A847A]">
                minimum investment
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#5C635E]">
              <li>City showroom or pickup point for riders</li>
              <li>Retail bookings, Rent to Own intros, local service</li>
              <li>Stocked from an EVUDDY distributor or company hub</li>
            </ul>
            {showApply ? (
              <Link
                href="/partners/dealer"
                className="mt-8 inline-flex items-center gap-2 bg-[#1F6B4A] px-6 py-3 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
              >
                Apply as dealer
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/partners/dealer"
                className="mt-8 inline-flex items-center gap-2 bg-[#1F6B4A] px-6 py-3 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
              >
                Open dealer form
                <ArrowRight size={16} />
              </Link>
            )}
          </article>

          <article className="bg-[#FBF9F5] p-8 sm:p-10">
            <Network size={20} strokeWidth={1.5} className="text-[#1F6B4A]" />
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-[#5F6B63]">
              Distributor · wholesale
            </p>
            <h3 className="font-display mt-2 text-3xl font-medium text-[#1C1917]">
              EVUDDY Distributor
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#5C635E]">
              {dealerProgram.distributorRole}
            </p>
            <p className="mt-6 font-display text-2xl font-medium text-[#1C1917]">
              {dealerProgram.distributorMin}
              <span className="ml-2 text-base font-sans font-normal text-[#8A847A]">
                minimum investment
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#5C635E]">
              <li>Territory warehouse and dealer onboarding</li>
              <li>Supply scooters, spares and brand standards</li>
              <li>Works with EVUDDY ops — not a rider rental desk</li>
            </ul>
            {showApply ? (
              <Link
                href="/partners/distributor"
                className="mt-8 inline-flex items-center gap-2 border border-[#1C1917]/15 px-6 py-3 text-[13px] font-medium tracking-[0.08em] text-[#1C1917] hover:border-[#1F6B4A]"
              >
                Apply as distributor
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/partners/distributor"
                className="mt-8 inline-flex items-center gap-2 border border-[#1C1917]/15 px-6 py-3 text-[13px] font-medium tracking-[0.08em] text-[#1C1917] hover:border-[#1F6B4A]"
              >
                Open distributor form
                <ArrowRight size={16} />
              </Link>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
