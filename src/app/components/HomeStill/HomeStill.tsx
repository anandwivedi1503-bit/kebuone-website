const stills = [
  { crop: "object-[42%_58%]", kicker: "Range", title: "120 KM" },
  { crop: "object-[58%_62%]", kicker: "Live tracking", title: "GPS" },
  { crop: "object-[50%_48%]", kicker: "Speed", title: "45 km/h" },
];

export default function HomeStill() {
  return (
    <section className="bg-[#F7F4EE] py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Electric scooter
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {stills.map((item) => (
            <figure key={item.title} className="group overflow-hidden">
              <img
                src="/new-vehicle.jpeg"
                alt={`EVUDDY scooter — ${item.title}`}
                className={`h-64 w-full object-cover sm:h-80 lg:h-[28rem] ${item.crop} transition duration-[1200ms] ease-out group-hover:scale-[1.04]`}
              />
              <figcaption className="mt-4 flex items-baseline justify-between border-t border-[#E4DDD2] pt-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A847A]">{item.kicker}</span>
                <span className="font-display text-2xl font-medium text-[#1C1917]">{item.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
