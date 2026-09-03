const stills = [
  { src: "/brand/white-house-yard.png", alt: "EVUDDY pickup courtyard", kicker: "Hub", title: "Pickup at the yard" },
  { src: "/brand/yellow-house-parked.png", alt: "EVUDDY yellow scooter at a white house", kicker: "Fleet", title: "Ready to ride" },
  { src: "/brand/white-house-dusk.png", alt: "White houses at dusk", kicker: "Live in city", title: "After hours" },
  { src: "/new-vehicle.jpeg", alt: "Original EVUDDY yellow scooter", kicker: "Range", title: "120 KM" },
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
            <figure key={item.title} className="group overflow-hidden">
              <img
                src={item.src}
                alt={item.alt}
                className="h-64 w-full object-cover sm:h-80 lg:h-[28rem] transition duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <figcaption className="mt-4 flex items-baseline justify-between gap-3 border-t border-[#E4DDD2] pt-3">
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
