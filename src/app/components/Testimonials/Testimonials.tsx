export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Kebu One is building a complete ecosystem for mobility, deliveries and trusted home services. The platform experience is smooth and reliable.",
      role: "Early Customer",
      city: "Delhi",
    },
    {
      quote:
        "The EV mobility vision and multi-service approach make Kebu One a promising platform for modern cities and sustainable transportation.",
      role: "Business Partner",
      city: "Lucknow",
    },
    {
      quote:
        "Having rides, deliveries, househelp and EV rentals under one platform creates a convenient experience for customers and partners alike.",
      role: "Service Partner",
      city: "Kanpur",
    },
  ];

  return (
    <section className="relative py-20 md:py-24 lg:py-32 bg-gradient-to-b from-[#FFF4F8] via-white to-[#FFF4F8] overflow-hidden">
      {/* Background Glow */}
<div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/10 blur-[180px] rounded-full"></div>

<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#EEB440]/10 blur-[180px] rounded-full"></div>
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-pink-100 shadow-lg">

  <span className="text-pink-600 uppercase tracking-[4px] font-bold">
    CUSTOMER STORIES
  </span>

  <span className="w-2 h-2 rounded-full bg-pink-500"></span>

  <span className="text-gray-600">
    Trusted Across Cities
  </span>

</div>

  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mt-4 mb-6 text-[#0A1134] leading-[1] max-w-5xl mx-auto">
    Trusted By People
    <br />
    Across Multiple Cities
  </h2>

  <p className="text-gray-600 text-lg max-w-3xl mx-auto">
    Real feedback from customers and partners who experience
    the Kebu One ecosystem every day.
  </p>

  <div className="flex justify-center mt-8 mb-12">
  <div className="h-1 w-32 rounded-full bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
</div>

  <div className="flex flex-wrap justify-center gap-4 mt-10">

    <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
      ⭐ 5-Star Experience
    </div>

    <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
      ✓ Trusted Partners
    </div>

    <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
      🛡 Verified Services
    </div>

  </div>

</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">

          {testimonials.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden h-full flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/95 backdrop-blur-xl border border-pink-100 p-6 lg:p-8 shadow-xl hover:-translate-y-3 hover:border-pink-300 hover:shadow-[0_35px_90px_rgba(255,22,94,0.18)] transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
             <div className="absolute top-6 right-6 text-7xl text-pink-100 font-bold">
      "
    </div>
             

              <p className="text-gray-700 text-base sm:text-lg leading-8 mb-8 flex-1 italic">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {item.role.charAt(0)}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">
                    {item.role}
                  </h4>

                  <p className="text-gray-500">
  {item.city}
</p>

</div>

              </div>

            </div>
          ))}

        </div>
                </div>

        {/* Bottom CTA */}

        <div className="text-center mt-12 md:mt-20">

         <p className="text-[#0A1134]/70 text-lg mb-6 max-w-3xl mx-auto">
  Building India's next trusted urban services ecosystem —
  one customer, one city and one service at a time.
</p>

          <a
  href="/register"
  className="inline-block bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] px-10 py-4 rounded-2xl text-white font-semibold shadow-xl hover:scale-105 transition-all duration-300"
>
  Join Kebu One Today →
</a>

      </div>
    </section>
  );
}