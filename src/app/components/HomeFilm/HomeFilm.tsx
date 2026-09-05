import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

export default function HomeFilm() {
  return (
    <section className="relative bg-[#1C1917]">
      <div className="relative w-full overflow-hidden">
        <video
          src={BRAND.film}
          autoPlay
          muted
          loop
          playsInline
          poster={BRAND.filmPoster}
          className="aspect-video h-auto w-full object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:px-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/65">
            Smart electric mobility
          </p>
          <h2 className="font-display mt-3 max-w-xl text-4xl font-medium leading-tight text-white sm:text-5xl">
            Pickup at the yard.
            <span className="mt-2 block italic text-white/85">Ride with OTP.</span>
          </h2>
          <Link href="/ride-options" className="mt-8 inline-block">
            <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917]">
              Book an EV
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
