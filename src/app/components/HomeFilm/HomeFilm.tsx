import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeFilm() {
  return (
    <section className="bg-[#1C1917]">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden">
        <div className="relative aspect-[16/9] min-h-[420px] sm:min-h-[520px]">
          <video
            src={BRAND.film}
            autoPlay
            muted
            loop
            playsInline
            poster={BRAND.range}
            className="absolute inset-0 h-full w-full object-contain object-center sm:object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1C1917] via-[#1C1917]/70 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end px-5 py-10 sm:min-h-[520px] sm:px-8 sm:py-14 lg:px-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/65">
              Smart electric mobility
            </p>
            <h2 className="font-display mt-3 max-w-xl text-4xl font-medium text-white sm:text-5xl">
              Pickup at the yard.
              <span className="mt-1 block italic text-white/85">Ride with OTP.</span>
            </h2>
            <Link href="/ride-options" className="mt-8 mb-2 w-fit">
              <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917]">
                Book an EV
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
