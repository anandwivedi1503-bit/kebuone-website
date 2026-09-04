import { BRAND } from "@/lib/brandMedia";

const stills = [
  { src: BRAND.rider, alt: "EVUDDY yellow scooter on a scenic road", kicker: "Range", title: "120 KM" },
  { src: BRAND.city, alt: "EVUDDY yellow scooter on an Indian city road", kicker: "Live in city", title: "City ride" },
  { src: BRAND.highway, alt: "EVUDDY yellow scooter on a highway", kicker: "Open road", title: "Scenic" },
  { src: BRAND.parked, alt: "EVUDDY yellow scooter parked roadside", kicker: "Hub", title: "Pickup ready" },
];

export default function HomeStill() {
  return (
    <section className="bg-[#F7F4EE] py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Electric scooter
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stills.map((item) => (
            <figure key={item.title} className="group bg-[#EDE8DE]">
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover object-center transition duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
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
