import { BRAND } from "@/lib/brandMedia";

const places = [
  { src: BRAND.dusk, kicker: "Dusk", title: "After work" },
  { src: BRAND.yard, kicker: "Yard", title: "Hub ready" },
  { src: BRAND.wall, kicker: "Street", title: "City quiet" },
  { src: BRAND.houseParked, kicker: "Home", title: "Parked" },
];

export default function HomePlaces() {
  return (
    <section className="bg-[#1C1917]">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
          Shot on Indian roads
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl font-medium text-white sm:text-4xl">
          The same yellow scooter. <span className="italic text-[#A8E6C3]">Different India.</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => (
          <figure key={place.title} className="group relative min-h-[280px] overflow-hidden sm:min-h-[380px]">
            <img
              src={place.src}
              alt={`EVUDDY scooter — ${place.title}`}
              className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-transparent to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{place.kicker}</p>
              <p className="font-display mt-1 text-2xl font-medium">{place.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
