import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Leadership from "../components/Leadership/Leadership";

export const metadata: Metadata = {
  title: "Leadership | EVUDDY",
  description:
    "Meet EVUDDY leadership: Chairman Anjali Mishra, Founder and CEO Sunil Pathak, General Manager Bindu Singh, Operations Incharge Anoop Pathak, and Software Development Engineer Anand Dhar Dwivedi.",
};

export default function LeadershipPage() {
  return (
    <main>
      <Navbar />
      <Leadership />
      <Footer />
    </main>
  );
}
