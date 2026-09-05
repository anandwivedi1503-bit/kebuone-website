import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeMoment() {
  return (
    <section className="overflow-hidden bg-[#1C1917]">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.42fr_0.58fr]">
        <div className="flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/70">
            Live in city
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.2] text-white sm:text-5xl">
            मिनटों में बुक करें.
            <span className="mt-2 block italic leading-[1.25]">शहर घूमें. राइड अपना बनाएँ.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/80 sm:text-[15px]">
            Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
          </p>
          <Link href="/ride-options" className="mt-8 inline-block">
            <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917] transition hover:bg-[#F7F4EE]">
              Book an EV
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
        <div className="relative aspect-[16/9] min-h-[280px] overflow-hidden lg:min-h-full">
          <img
            src={BRAND.cityCommute}
            alt="EVUDDY scooter on a clean city boulevard commute"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
