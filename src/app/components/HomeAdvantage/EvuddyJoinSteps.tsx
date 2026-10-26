"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Verify mobile",
    text: "OTP on Book EV — new riders finish KYC after.",
  },
  {
    n: "02",
    title: "Choose plan",
    text: "Normal rental or Rent to Own · pick hub & scooter.",
  },
  {
    n: "03",
    title: "Pay & ride",
    text: "Pickup OTP at the yard · GPS on the yellow fleet.",
  },
] as const;

/** Zypp-style join flow — three steps only. */
export default function EvuddyJoinSteps() {
  return (
    <section className="bg-[#F7F4EE] py-14 sm:py-16">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-[#1F6B4A]">
          How to join
        </p>
        <h2 className="font-display mt-3 text-center text-3xl font-medium tracking-tight text-[#1C1917] sm:text-4xl">
          Ride in three steps
        </h2>
        <ol className="mt-10 space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.n} className="relative flex gap-4 pb-10 last:pb-0">
              {index < STEPS.length - 1 ? (
                <span
                  className="absolute left-[15px] top-10 h-[calc(100%-2rem)] w-px bg-[#1F6B4A]/25"
                  aria-hidden
                />
              ) : null}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F6B4A] text-xs font-bold text-white">
                {step.n}
              </span>
              <div>
                <p className="flex items-center gap-2 text-lg font-semibold text-[#1C1917]">
                  {step.title}
                  <CheckCircle2 size={16} className="text-[#1F6B4A]" aria-hidden />
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5C635E]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <Link
            href="/ride-options"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1C1917] px-8 text-[13px] font-semibold tracking-[0.06em] text-white hover:bg-[#1F6B4A]"
          >
            Start on Book EV
          </Link>
        </div>
      </div>
    </section>
  );
}
