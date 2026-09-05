import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeMoment() {
  return (
    <section className="bg-[#1C1917]">
      <div className="mx-auto grid max-w-[1440px] items-center lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/70">
            Live in city
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.25] text-white sm:text-5xl">
            मिनटों में बुक करें.
            <span className="mt-3 block italic leading-[1.3]">शहर घूमें. राइड अपना बनाएँ.</span>
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
        <div className="bg-[#1C1917]">
          <img
            src={BRAND.cityCommute}
            alt="EVUDDY scooter on a city road"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
