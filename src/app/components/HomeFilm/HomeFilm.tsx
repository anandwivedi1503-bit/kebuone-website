import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeFilm() {
  return (
    <section className="relative overflow-hidden bg-[#1C1917]">
      <img
        src="/brand/indian-city-road.png"
        alt="EVUDDY yellow scooter on an Indian city road"
        className="absolute inset-0 h-full w-full object-cover opacity-80 ev-ken"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1C1917] via-[#1C1917]/55 to-transparent" />
      <div className="relative mx-auto flex min-h-[380px] max-w-[1440px] flex-col justify-end px-5 py-16 sm:min-h-[480px] sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/65">
          Smart electric mobility
        </p>
        <h2 className="font-display mt-3 max-w-xl text-4xl font-medium text-white sm:text-5xl">
          Pickup at the yard.
          <span className="mt-1 block italic text-white/85">Ride with OTP.</span>
        </h2>
        <Link href="/ride-options" className="mt-8 w-fit">
          <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917]">
            Book an EV
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
