"use client";

import { useEffect, useState } from "react";

import Navbar from "../Navbar/Navbar";
import BikeBooking from "../components/BikeBooking/BikeBooking";
import Footer from "../components/Footer/Footer";
import { hasRiderPlanReady } from "@/lib/riderPlanGate";

export default function BookBikePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rentalFlow =
      new URLSearchParams(window.location.search).get("flow") === "rental";

    if (hasRiderPlanReady() && rentalFlow) {
      setReady(true);
      return;
    }

    window.location.replace("/ride-options");
  }, []);

  if (!ready) {
    return (
      <main>
        <Navbar />
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
