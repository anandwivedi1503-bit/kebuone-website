import { BRAND, SCOOTER_FRAME, SCOOTER_IMG } from "@/lib/brandMedia";

const places = [
  {
    src: BRAND.cityCommute,
    kicker: "Street",
    title: "City commute",
    alt: "EVUDDY scooter in dense Indian city traffic",
  },
  {
    src: BRAND.afterWork,
    kicker: "Evening",
    title: "After work",
    alt: "Rider coming home after work on an EVUDDY scooter",
  },
  {
    src: BRAND.yard,
    kicker: "Yard",
    title: "Hub pickup",
    alt: "Commercial EVUDDY hub with scooters ready for OTP",
  },
  {
    src: BRAND.houseParked,
    kicker: "Home",
    title: "Parked at gate",
    alt: "EVUDDY scooter parked at a home courtyard",
  },
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
          <figure key={place.title} className="overflow-hidden bg-[#1C1917]">
            <div className={`aspect-[4/5] sm:aspect-[3/4] ${SCOOTER_FRAME}`}>
              <img src={place.src} alt={place.alt} className={SCOOTER_IMG} />
            </div>
            <figcaption className="bg-[#1C1917] px-5 py-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{place.kicker}</p>
              <p className="font-display mt-1 text-2xl font-medium">{place.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
