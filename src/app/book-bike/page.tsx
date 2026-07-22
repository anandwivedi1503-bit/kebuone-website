"use client";

import { useEffect, useState } from "react";

import Navbar from "../Navbar/Navbar";
import BikeBooking from "../components/BikeBooking/BikeBooking";
import Footer from "../components/Footer/Footer";

export default function BookBikePage() {

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {

    const riderId = localStorage.getItem("kebu_rider_id");
    const phone = localStorage.getItem("kebu_rider_phone");

    if (riderId && phone) {
      setAllowed(true);
    }

  }, []);

  if (!allowed) {

    return (

      <main>

        <Navbar />

        <div className="pt-40 pb-40 text-center">

          <h1 className="text-4xl font-bold text-[#0A1134] mb-4">
            Rider Registration Required
          </h1>

          <p className="text-gray-600 mb-8">
            Please complete Rider Registration before booking a bike.
          </p>

          <button
            onClick={() => window.location.href = "/careers"}
            className="
            px-8
            py-4
            rounded-xl
            bg-gradient-to-r
            from-[#FF165E]
            to-[#FF5A8B]
            text-white
            font-bold
            "
          >
            Register Now
          </button>

        </div>

        <Footer />

      </main>

    );

  }

  return (

    <main>

      <Navbar />

      <div className="pt-20">
        <BikeBooking />
      </div>

      <Footer />

    </main>

  );

}