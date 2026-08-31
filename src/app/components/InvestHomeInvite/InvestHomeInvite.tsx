"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

const INVEST = "/partners#fleet-investment";

export default function InvestHomeInvite() {
  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[28px] border border-[#18B368]/15 bg-[#F4FBF7] px-6 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#18B368] text-white">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#18B368]">
                Fleet Partner Investment
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">
                From ₹1 lakh. 50/50 share. 42 months.
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Official poster, ₹1L / ₹5L / ₹10L plans, then apply — all on Invest.
              </p>
            </div>
          </div>
          <Link
            href={INVEST}
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#EC2A8C] px-7 font-bold text-white shadow-[0_12px_28px_rgba(236,42,140,0.28)] transition hover:bg-[#d01878] sm:w-auto"
          >
            Open Invest
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
