import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeMoment() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#1C1917] sm:min-h-[620px]">
      <img
        src={BRAND.cityCommute}
        alt="EVUDDY scooter in an Indian city commute"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/88 via-[#1C1917]/45 to-[#1C1917]/20" />
      <div className="relative mx-auto flex min-h-[520px] max-w-[1440px] items-center px-5 py-16 sm:min-h-[620px] sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-xl text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/70">
            Live in city
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.15] sm:text-5xl">
            मिनटों में बुक करें.
            <span className="mt-2 block italic leading-[1.2]">शहर घूमें. राइड अपना बनाएँ.</span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/80 sm:text-[15px]">
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
