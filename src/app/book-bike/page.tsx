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
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="pt-28 print:pt-0">
        <BikeBooking />
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}
