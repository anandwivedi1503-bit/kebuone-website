import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Leadership from "../components/Leadership/Leadership";

export const metadata: Metadata = {
  title: "Leadership | EVUDDY by Kebu One",
  description:
    "Meet EVUDDY leadership: Chairman Anjali Mishra, Founder and CEO Sunil Pathak, and General Manager Bindu Singh.",
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
