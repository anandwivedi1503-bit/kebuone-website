import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import AboutUs from "../components/AboutUs/AboutUs";
import Footer from "../components/Footer/Footer";

export const metadata: Metadata = {
  title: "About Us | EVUDDY",
  description:
    "EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C and Rent-to-Own solutions.",
};

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 sm:pt-40">
        <AboutUs />
      </div>
      <Footer />
    </main>
  );
}
