"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
  id="footer"
  className="bg-[#0A1134] text-white relative overflow-hidden"
>

      {/* Top Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]" />

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF165E]/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#EEB440]/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 py-14 md:py-24 relative z-10">

       <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">

  <h1 className="hidden lg:block text-[260px] font-black text-white/[0.03] select-none">
    KEBU
  </h1>

</div> 

        {/* CTA SECTION */}
        <div className="mb-16 rounded-3xl bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] p-[1px]">

          <div className="bg-[#08102D] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">

            <div>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[0.95]">
  The Future Of
  <br />
  Urban Services
  <br />
  Starts Here.
</h2>

<p className="text-xl text-gray-300 mt-6 max-w-2xl">
  Mobility, delivery, home services and EV solutions —
  powered by one unified technology platform.
</p>

<div className="flex flex-wrap gap-4 mt-8">

  <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#EEB440] transition-all duration-300">
    ⚡ Bike On Rent
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#FF5556] transition-all duration-300">
     🏠 Househelp
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#FF165E] transition-all duration-300">
    📦 Delivery
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#EEB440] transition-all duration-300">
    🚕 Cabs
  </div>


               <div className="flex flex-wrap gap-6 mt-6 text-sm">

    <div>
      <span className="text-[#EEB440] font-bold text-xl">4+</span>
      <p className="text-gray-400">Core Services</p>
    </div>

    <div>
      <span className="text-[#FF5556] font-bold text-xl">24/7</span>
      <p className="text-gray-400">Support</p>
    </div>

    <div>
      <span className="text-[#FF165E] font-bold text-xl">100%</span>
      <p className="text-gray-400">Verified Partners</p>
    </div>

  </div>

</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
  onClick={() =>
    alert(
      "🚀 Kebu One App will be launching soon. Stay tuned for updates."
    )
  }
  className="border border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#0A1134] transition duration-300 inline-block w-[260px]"
>
  Download App
</button>

              <a
  href="/partners"
  className="border border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#0A1134] transition duration-300 inline-block"
>
  Partner With Us →
</a>
            </div>

          </div>
        </div>

        

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">

          {/* COMPANY */} 
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 hover:shadow-[0_20px_60px_rgba(255,22,94,0.15)] transition-all duration-500">
            <Image
  src="/kebu_1-removebg-preview.png"
  alt="Kebu One"
  width={160}
  height={70}
  className="mb-6"
/>

            <h3 className="text-2xl font-bold mb-4 leading-tight">
              Building India's Next
              <br />
              Urban Services Super App
            </h3>

            <p className="text-gray-300 leading-relaxed mb-6">
              Kebu One is a technology-enabled multi-service platform
              bringing together mobility, delivery, househelp,
              hyperlocal services and EV rentals into one powerful ecosystem.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">

  <p className="text-sm text-gray-400 mb-3">
    Download Kebu One App
  </p>

  <div className="flex flex-col sm:flex-row gap-3">

    <button
  onClick={() =>
    alert(
      "🚀 Kebu One App will be launching soon. Stay tuned for updates."
    )
  }
  className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
>
  Google Play
</button>

    <button
  onClick={() =>
    alert(
      "🚀 Kebu One App will be launching soon. Stay tuned for updates."
    )
  }
  className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
>
  App Store
</button>

  </div>

</div>

            </div>

          {/* SERVICES */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 hover:shadow-[0_20px_50px_rgba(255,22,94,0.12)] transition-all duration-500">

            <h4 className="font-bold text-xl mb-5 text-[#EEB440]">
              Services
            </h4>

            <ul className="space-y-3 text-gray-300">

              <li>
  <a href="/register" className="hover:text-[#EEB440] transition duration-300">
    Kebu Bike On Rent
  </a>
</li>

              <li className="hover:text-[#EEB440] transition duration-300 cursor-pointer">
                Kebu Househelp
              </li>

              <li className="hover:text-[#EEB440] transition duration-300 cursor-pointer">
                Kebu Delivery
              </li>

              <li className="hover:text-[#EEB440] transition duration-300 cursor-pointer">
                Kebu Ride
              </li>

              <li className="hover:text-[#EEB440] transition duration-300 cursor-pointer">
                Corporate Mobility
              </li>

              <li className="hover:text-[#EEB440] transition duration-300 cursor-pointer">
                Hyperlocal Services
              </li>

            </ul>

          </div>

          {/* COMPANY LINKS */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 hover:shadow-[0_20px_50px_rgba(255,22,94,0.12)] transition-all duration-500">

            <h4 className="font-bold text-xl mb-5 text-[#FF5556]">
              Company
            </h4>

            <ul className="space-y-3 text-gray-300">

              <li>
  <a href="/about" className="hover:text-[#EEB440] transition duration-300">
    About Us
  </a>
</li>

<li>
  <a href="/vision" className="hover:text-[#EEB440] transition duration-300">
    Our Vision
  </a>
</li>

<li>
  <a href="/careers" className="hover:text-[#EEB440] transition duration-300">
    Careers
  </a>
</li>

<li>
  <a href="/partners" className="hover:text-[#EEB440] transition duration-300">
    Become Partner
  </a>
</li>

<li>
  <a href="/contact" className="hover:text-[#EEB440] transition duration-300">
    Contact Us
  </a>
</li>

            </ul>

          </div>

          {/* CONTACT */}
          <div
  id="contact"
  className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 hover:shadow-[0_20px_50px_rgba(255,22,94,0.12)] transition-all duration-500"
>
            <h4 className="font-bold text-xl mb-5 text-[#FF165E]">
              Contact
            </h4>

            <div className="space-y-5 text-gray-300">

  <div className="flex items-center gap-3">
    <span className="text-xl">📧</span>
    <span>info@kebuone.com</span>
  </div>

  <div className="flex items-center gap-3">
    <span className="text-xl">📞</span>
    <span>+91 9151074229</span>
  </div>

  <div className="flex items-center gap-3">
    <span className="text-xl">⏰</span>
    <span>24/7 Customer Support</span>
  </div>

</div>
</div>
        </div>

        

            

        {/* SOCIAL LINKS */}

<div className="mt-14">

  <h4 className="text-center text-gray-400 uppercase tracking-widest text-sm mb-6">
    Follow Kebu One
  </h4>

  <div className="flex flex-wrap justify-center gap-4">

    <a
      href="https://www.instagram.com/kebuone/"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-3 rounded-full font-medium bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 transition-all duration-300"
    >
      Instagram
    </a>

    <a
      href="https://www.linkedin.com/company/kebu-one/"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
    >
      LinkedIn
    </a>

    <a
  href="https://youtube.com/@kebuone?si=ertP6rbNyGOyjRW9"
  target="_blank"
  rel="noopener noreferrer"
  className="px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
>
  YouTube
</a>

  </div>

</div>

  

      {/* BOTTOM BAR */}
     <div className="border-t border-white/10 mt-16 pt-8">

  <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

    <p className="text-gray-400 text-sm">
      © 2026 Kebu One. All Rights Reserved.
    </p>

    <p className="text-gray-500 text-sm">
      Powered by Shubrax Mobility Ltd.
    </p>

    <p className="text-gray-500 text-sm">
      India's Next Urban Services Ecosystem
    </p>

  </div>

</div>
</div>

    </footer>
  );
}