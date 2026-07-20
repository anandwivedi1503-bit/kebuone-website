"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-screen text-white">
      {/* Background Effects */}
<div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#FF165E]/20 blur-[180px] rounded-full"></div>

<div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#EEB440]/20 blur-[180px] rounded-full"></div>
      


      <div className="absolute inset-0">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/final-video.mp4" type="video/mp4" />
  </video>

  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35"></div>
</div>

 <div className="relative z-20 min-h-screen flex items-center py-20 lg:py-24">
  <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-16">
    <div className="max-w-3xl w-full animate-fadeIn">
    

    <span className="inline-flex items-center px-5 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-white text-sm font-medium mb-8 shadow-xl">
      India's First Operations-First Urban Service Ecosystem
    </span>

    <h1 className="text-[44px] sm:text-[58px] md:text-[72px] lg:text-[88px] xl:text-[96px] font-black leading-[1.05] tracking-[-0.05em] text-white">
  Bike On Rent

  <span className="block text-white">
    Househelp.
  </span>

  <span className="block text-[#EEB440] pb-2 md:pb-3 lg:pb-4">
    Cab & Delivery.
  </span>
</h1>

<p className="block text-white/70 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-snug mt-4 sm:mt-5 md:mt-6 lg:mt-8">
  Welcome to Kebu One!
</p>

<p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl lg:max-w-2xl mt-5 leading-relaxed">
India's first operations-first super app connecting bike rentals, househelp, cabs and deliveries through one intelligent platform.
</p>

  
    <div className="flex items-center gap-3 mt-6 mb-6">

  <div className="w-12 h-[2px] bg-[#FF165E]"></div>

  <span className="text-[#FF165E] text-sm font-semibold uppercase tracking-widest">
    Super App Ecosystem
  </span>

</div>

    <div className="flex flex-col md:flex-row gap-5 mt-12 w-full sm:w-auto">

  {/* Download App */}
  <button
    onClick={() =>
      alert(
        "🚀 Kebu One App is currently under development and will be launching soon. Stay tuned for updates."
      )
    }
    className="w-full md:w-auto bg-gradient-to-r from-[#FF165E] to-[#FF5A8B] text-white px-10 py-5 rounded-2xl font-semibold shadow-[0_20px_60px_rgba(255,22,94,0.35)] hover:scale-105 transition-all duration-300"
  >
    Download App
  </button>

  {/* Book Now */}
  <Link
  href="/register"
  className="w-full md:w-auto bg-[#EEB440] text-[#0A1134] px-10 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all duration-300 inline-block"
>
  Book Now
</Link>

  {/* Become Partner */}
  <Link
  href="/partners"
  className="w-full md:w-auto bg-white/15 backdrop-blur-xl border border-white/30 text-white px-8 py-5 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 inline-block"
>
  Become Partner
</Link>

</div>

     

    </div>
  </div>  

  

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">

  {/* Bike */}

  <div className="group relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] hover:border-[#FF165E] hover:shadow-[0_35px_90px_rgba(255,22,94,0.45)]">
    <span className="absolute top-4 left-4 z-20 bg-[#FF165E] text-white text-xs font-semibold px-3 py-1 rounded-full">
      BIKE RENTAL
    </span>

    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-56 md:h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
>
  <source src="/kebu-final.mp4" type="video/mp4" />
</video>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

    <div className="p-6 bg-gradient-to-b from-transparent to-black/30">

      <h3 className="text-2xl font-bold text-white tracking-tight">
        Bike On Rent
      </h3>

      <p className="mt-3 text-white/75 leading-relaxed text-[15px]">
        Rent electric bikes by minute, hour or day.
      </p>

      <Link
href="/register"
className="mt-6 inline-flex items-center gap-2 text-[#EEB440] font-semibold hover:gap-4 transition-all duration-300"
>
Explore Service →
</Link>
    </div>

  </div>

  {/* Househelp */}

  <div className="group relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] hover:border-[#FF165E] hover:shadow-[0_35px_90px_rgba(255,22,94,0.45)]">
    <span className="absolute top-4 left-4 z-20 bg-[#EEB440] text-[#0A1134] text-xs font-semibold px-3 py-1 rounded-full">
      HOUSEHELP
    </span>

    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-56 md:h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
    >
      <source src="/househelp last.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

    <div className="p-6 bg-gradient-to-b from-transparent to-black/30">

      <h3 className="text-2xl font-bold text-white tracking-tight">
        Househelp
      </h3>

      <p className="mt-3 text-white/75 leading-relaxed text-[15px]">
        Professional household services whenever you need them.
      </p>

      <button className="mt-6 inline-flex items-center gap-2 text-[#EEB440] font-semibold transition-all duration-300 group-hover:gap-4">
        Explore Service →
      </button>

    </div>

  </div>

  {/* Cab & Delivery */}

  <div className="group relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] hover:border-[#FF165E] hover:shadow-[0_35px_90px_rgba(255,22,94,0.45)]">
    <span className="absolute top-4 left-4 z-20 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
      CAB & DELIVERY
    </span>

    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-56 md:h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
    >
      <source src="/hero-del.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

    <div className="p-6 bg-gradient-to-b from-transparent to-black/30">

      <h3 className="text-2xl font-bold text-white tracking-tight">
        Cab & Delivery
      </h3>

      <p className="mt-3 text-white/75 leading-relaxed text-[15px]">
        Book rides or send parcels instantly from one platform.
      </p>

      <button className="mt-6 inline-flex items-center gap-2 text-[#EEB440] font-semibold transition-all duration-300 group-hover:gap-4">
        Explore Service →
      </button>

    </div>

  </div>

</div>

 
         </section>
        );
        }