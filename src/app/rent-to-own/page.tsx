"use client";

import { useEffect, useState } from "react";

import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import RentToOwnBooking from "@/app/components/RentToOwn/RentToOwnBooking";
import { hasRiderPlanReady } from "@/lib/riderPlanGate";

export default function RentToOwnPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasRiderPlanReady()) {
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
      <div className="pt-28">
        <RentToOwnBooking />
      </div>
      <Footer />
    </main>
  );
}
