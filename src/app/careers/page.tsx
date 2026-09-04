import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import Careers from "../components/Careers/Careers";
import Footer from "../components/Footer/Footer";

export const metadata: Metadata = {
  title: "Careers | EVUDDY",
  description:
    "Join EVUDDY and help build India's next-generation EV mobility ecosystem through B2B, B2C and Rent-to-Own.",
};

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 sm:pt-40">
        <Careers />
      </div>
      <Footer />
    </main>
  );
}
