"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import Navbar from "../Navbar/Navbar";
import BikeBooking from "../components/BikeBooking/BikeBooking";
import Footer from "../components/Footer/Footer";

export default function BookBikePage() {

  const [allowed, setAllowed] = useState(false);
const [checking, setChecking] = useState(true);

useEffect(() => {

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    const phone = user?.phoneNumber?.replace(/\D/g, "").slice(-10) || "";

    if (!user || !phone) {
      setAllowed(false);
      setChecking(false);
      return;
    }

    try {
      const idToken = await user.getIdToken();

      const response = await fetch(
        `/api/riders?phone=${phone}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();

      if (
  data.success &&
  data.data.bookingEnabled &&
  data.data.approvalStatus === "Approved" &&
  data.data.status === "Active"
) {

        setAllowed(true);

      } else {

        setAllowed(false);

      }

    } catch {

      setAllowed(false);

    }

    setChecking(false);

  });

  return () => unsubscribe();

}, []);

if (checking) {

  return (

    <main>

      <Navbar />

      <div className="pt-40 text-center">

        <h2 className="text-3xl font-bold">
          Checking Rider Status...
        </h2>

      </div>

      <Footer />

    </main>

  );

}

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
            onClick={() => window.location.href="/register"}
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
