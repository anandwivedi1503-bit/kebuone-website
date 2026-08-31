"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

const INVEST = "/partners#fleet-investment";

export default function InvestHomeInvite() {
  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-[#0B1B16] bg-[#07110C] px-6 py-7 text-white shadow-[0_24px_60px_rgba(7,17,12,0.28)] sm:flex-row sm:items-center sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#18B368]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#EC2A8C]/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#18B368] text-white shadow-[0_0_24px_rgba(24,179,104,0.45)]">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7A8]">
                  Fleet Partner Investment
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  From ₹1 lakh. 50/50 share. 42 months.
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
                  Official poster, ₹1L / ₹5L / ₹10L plans, then apply — all on Invest.
                </p>
              </div>
            </div>
            <Link
              href={INVEST}
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#EC2A8C] px-7 font-bold text-white shadow-[0_12px_28px_rgba(236,42,140,0.38)] transition hover:bg-[#d01878] sm:w-auto"
            >
              Open Invest
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
