import { BRAND, SCOOTER_FRAME, SCOOTER_IMG } from "@/lib/brandMedia";
import HomeImg from "../HomeMedia/HomeImg";

const stills = [
  { src: BRAND.cityCommute, alt: "EVUDDY scooter on a city boulevard commute", kicker: "City", title: "Commute" },
  { src: BRAND.afterWork, alt: "Coming home after work on EVUDDY", kicker: "Evening", title: "After work" },
  { src: BRAND.range, alt: "EVUDDY scooter on an open highway with 120 km range", kicker: "Range", title: "120 KM" },
  { src: BRAND.yard, alt: "EVUDDY flagship hub for OTP pickup", kicker: "Hub", title: "Pickup" },
];

export default function HomeStill() {
  return (
    <section className="bg-[#F7F4EE] py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Electric scooter
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {stills.map((item) => (
            <figure key={item.title} className="group bg-[#EDE8DE]">
              <div className={`aspect-[3/2] ${SCOOTER_FRAME}`}>
                <HomeImg src={item.src} alt={item.alt} className={SCOOTER_IMG} />
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
