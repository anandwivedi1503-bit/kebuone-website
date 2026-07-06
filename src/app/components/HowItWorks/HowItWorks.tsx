export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "📱",
      title: "Choose Your Service",
      description:
         "Choose Bike Rental, Househelp, Ride Booking or Delivery based on your needs.",
    },
    {
      number: "02",
      icon: "⚡",
      title: "Book In Seconds",
      description:
        "Use the Kebu One platform to instantly book trusted services with transparent pricing.",
    },
    {
      number: "03",
      icon: "📍",
      title: "Track In Real-Time",
      description:
        "Monitor your ride, delivery or service status through smart tracking technology.",
    },
    {
      number: "04",
      icon: "✅",
      title: "Enjoy Reliable Service",
      description:
        "Receive fast, secure and professional service from verified partners.",
    },
  ];

  return (
    <section className="relative py-20 md:py-24 lg:py-32 bg-gradient-to-b from-[#FFF4F8] via-white to-[#FFF4F8] overflow-hidden">
      {/* Background Glow */}

<div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/10 blur-[180px] rounded-full"></div>

<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#EEB440]/10 blur-[180px] rounded-full"></div>
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

         <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-pink-50 border border-pink-100 mb-8">

  <span className="text-pink-600 font-bold tracking-[3px]">
    SIMPLE PROCESS
  </span>

  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>

  <span className="text-pink-600 font-semibold">
    4 Easy Steps
  </span>

</div> 

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 text-[#0A1134] leading-[0.95]">
  Your Journey With
  <br />
  Kebu One
</h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Get access to Bike Rentals, rides, deliveries and
            trusted househelp services through one seamless platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">

  <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
    ⚡ Fast Booking
  </div>

  <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
    ✓ Verified Partners
  </div>

  <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
    📍 Live Tracking
  </div>

  <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 text-[#0A1134] font-semibold">
    🛡️ Trusted Service
  </div>

</div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {steps.map((step, index) => (
            <div
              key={index}
              
        className="group relative h-full flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/95 backdrop-blur-xl border border-pink-100 p-6 lg:p-8 shadow-xl hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(255,22,94,0.18)] transition-all duration-500">
           {index < steps.length - 1 && (
             <div className="hidden lg:block absolute top-28 -right-8 w-16 h-[2px] bg-gradient-to-r from-pink-100 to-orange-100 opacity-40 z-10"></div>
            )}

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-pink-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>

              <div className="absolute top-5 right-5 text-6xl font-bold text-pink-100">
                {step.number}
              </div>

              <div className="text-5xl lg:text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {step.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {step.title}
              </h3>

              <p className="text-gray-600 leading-7 flex-1">
                {step.description}
              </p>

            </div>
          ))}

        </div>
                </div>

        {/* Bottom CTA */}

        <div className="mt-20 text-center">

          <p className="text-[#0A1134]/70 mb-6 text-lg">
            Growing every day with a vision to become India's most trusted urban services ecosystem.
          </p>

          <a
  href="/register"
  className="inline-block bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] px-10 py-4 rounded-2xl text-white font-semibold shadow-xl hover:scale-105 transition-all duration-300"
>
  Get Started with Kebu One →
</a>
          </div>
    </section>
  );
}