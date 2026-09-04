import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeMoment() {
  return (
    <section className="relative overflow-hidden bg-[#1C1917]">
      <img
        src={BRAND.highway}
        alt="EVUDDY yellow scooter on a scenic Indian highway"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/82 via-[#1C1917]/40 to-transparent" />
      <div className="relative mx-auto flex min-h-[420px] max-w-[1440px] items-end px-5 py-16 sm:min-h-[520px] sm:px-8 lg:px-12 lg:py-20">
        <div className="max-w-lg text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/70">
            Live in city
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-tight sm:text-5xl">
            मिनटों में बुक करें.
            <span className="mt-1 block italic">शहर घूमें. राइड अपना बनाएँ.</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/75">
            Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
          </p>
          <Link href="/ride-options" className="mt-8 inline-block">
            <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917] transition hover:bg-[#F7F4EE]">
              Book an EV
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
