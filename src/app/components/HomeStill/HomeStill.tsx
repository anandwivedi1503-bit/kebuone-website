import { BRAND, SCOOTER_FRAME, SCOOTER_IMG } from "@/lib/brandMedia";

const stills = [
  { src: BRAND.rider, alt: "EVUDDY yellow scooter on a scenic road", kicker: "Range", title: "120 KM" },
  { src: BRAND.city, alt: "EVUDDY yellow scooter on an Indian city road", kicker: "Live in city", title: "City ride" },
  { src: BRAND.highway, alt: "EVUDDY yellow scooter on a highway", kicker: "Open road", title: "Scenic" },
  { src: BRAND.parked, alt: "EVUDDY yellow scooter parked roadside", kicker: "Hub", title: "Pickup ready" },
  { src: BRAND.houseParked, alt: "EVUDDY yellow scooter parked at a home gate", kicker: "Home", title: "Parked" },
];

export default function HomeStill() {
  return (
    <section className="bg-[#F7F4EE] py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Electric scooter
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stills.map((item) => (
            <figure key={item.title} className="group bg-[#EDE8DE]">
              <div className={`aspect-[16/10] ${SCOOTER_FRAME}`}>
                <img src={item.src} alt={item.alt} className={SCOOTER_IMG} />
              </div>
              <figcaption className="flex items-baseline justify-between gap-3 border-t border-[#E4DDD2] px-1 pt-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A847A]">{item.kicker}</span>
                <span className="font-display text-right text-xl font-medium text-[#1C1917] sm:text-2xl">
                  {item.title}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
