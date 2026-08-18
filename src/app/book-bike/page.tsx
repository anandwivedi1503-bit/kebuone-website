"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import Navbar from "../Navbar/Navbar";
import BikeBooking from "../components/BikeBooking/BikeBooking";
import Footer from "../components/Footer/Footer";

function hasRentalFlow() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("flow") === "rental";
}

export default function BookBikePage() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rentalFlow, setRentalFlow] = useState(false);

  useEffect(() => {
    setRentalFlow(hasRentalFlow());

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const phone = user?.phoneNumber?.replace(/\D/g, "").slice(-10) || "";

      if (!user || !phone) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/riders?phone=${phone}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();

        setAllowed(
          Boolean(
            data.success &&
              data.data.bookingEnabled &&
              data.data.approvalStatus === "Approved" &&
              data.data.status === "Active"
          )
        );
      } catch {
        setAllowed(false);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!checking && allowed && !rentalFlow) {
      window.location.replace("/ride-options");
    }
  }, [checking, allowed, rentalFlow]);

  if (checking || (allowed && !rentalFlow)) {
    return (
      <main>
        <Navbar />
        <div className="pt-40 text-center">
          <h2 className="text-3xl font-bold">Opening your ride options...</h2>
        </div>
        <Footer />
      </main>
    );
  }

  if (!allowed) {
    return (
      <main>
        <Navbar />
        <div className="px-4 pt-40 pb-40 text-center">
          <h1 className="mb-4 text-4xl font-bold text-[#0A1134]">
            Rider Registration Required
          </h1>
          <p className="mb-8 text-gray-600">
            Please complete Rider Registration before booking a bike.
          </p>
          <button
            onClick={() => (window.location.href = "/register")}
            className="rounded-xl bg-gradient-to-r from-[#FF165E] to-[#FF5A8B] px-8 py-4 font-bold text-white"
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
