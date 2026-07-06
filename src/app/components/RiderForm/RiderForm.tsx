"use client";

import { motion } from "framer-motion";

export default function RiderForm() {
  return (
    <section className="py-32 bg-gradient-to-b from-white via-[#FFF7FA] to-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT VIDEO */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >

            <div className="overflow-hidden rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.18)]">

              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[650px] object-cover"
              >
                <source src="/hero-video six.mp4" type="video/mp4" />
              </video>

            </div>

            <div className="absolute -bottom-6 left-6 bg-white rounded-2xl px-5 py-3 shadow-xl">
              <p className="text-[#0A1134] font-bold">
                🚲 Bike On Rent
              </p>
            </div>

          </motion.div>

          {/* RIGHT FORM */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >

            <span className="inline-flex items-center px-5 py-2 rounded-full bg-pink-50 border border-pink-100 text-[#FF165E] font-semibold mb-6">
              Start Riding With Kebu
            </span>

            <h2 className="text-5xl md:text-6xl font-black text-[#0A1134] leading-tight mb-6">
              Register For
              <span className="block text-[#FF165E]">
                Bike On Rent
              </span>
            </h2>

            <p className="text-gray-600 text-lg mb-10">
              Complete your rider registration and get access to Kebu One's smart urban mobility ecosystem.
            </p>

            <form
  className="bg-white rounded-[36px] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-pink-100"
>

              <div className="grid md:grid-cols-2 gap-5">

                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
                />

                <input
                  type="text"
                  placeholder="City"
                  required
                  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
                />

                <input
                  type="text"
                  placeholder="Aadhaar Number"
                  required
                  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
                />

                <input
  type="text"
  placeholder="Driving License Number"
  required
  className="h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
/>

                </div>

          

              <div className="grid md:grid-cols-3 gap-5 mt-5">

                <div>
                  <label className="text-sm text-gray-600 block mb-2">
                    Upload Aadhaar
                  </label>

                  <input
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  required
  className="w-full border border-gray-200 rounded-2xl p-3"
/>
</div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">
                    Upload Driving License
                  </label>

                  <input
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  required
  className="w-full border border-gray-200 rounded-2xl p-3"
/>
</div>

                <div>
  <label className="text-sm text-gray-600 block mb-2">
    Upload Profile Photo
  </label>

  <input
  type="file"
  accept="image/*"
  required
  className="w-full border border-gray-200 rounded-2xl p-3"
/>
</div>
              </div>

              <button
              type="submit"
                className="
                mt-8
                w-full
                h-16
                rounded-2xl
                bg-gradient-to-r
                from-[#FF165E]
                to-[#FF5A8B]
                text-white
                font-bold
                text-lg
                hover:scale-[1.02]
                transition-all
                duration-300
                shadow-[0_20px_60px_rgba(255,22,94,0.30)]
                "
              >
                Start Riding →
              </button>

</form>

</motion.div>

</div>

</div>

</section>
  );
}