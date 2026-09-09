"use client";

import { useEffect, useState } from "react";

import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import RentToOwnBooking from "@/app/components/RentToOwn/RentToOwnBooking";
import RiderSessionBar from "@/app/components/RiderSession/RiderSessionBar";
import { getChosenPlan, hasRiderPlanReady, setChosenPlan } from "@/lib/riderPlanGate";

export default function RentToOwnPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasRiderPlanReady()) {
      window.location.replace("/ride-options");
      return;
    }

    if (getChosenPlan() === "rental") {
      window.location.replace("/book-bike?flow=rental");
      return;
    }

    setChosenPlan("rto");
    setReady(true);
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
      <div className="pt-32 sm:pt-40">
        <div className="px-4 sm:px-6 lg:px-10">
          <RiderSessionBar />
        </div>
        <RentToOwnBooking />
      </div>
      <Footer />
    </main>
  );
}
