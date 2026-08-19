import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Leadership from "../components/Leadership/Leadership";

export const metadata: Metadata = {
  title: "Leadership | EVUDDY by Kebu One",
  description:
    "Meet EVUDDY leadership — Founder and CEO Sunil Pathak, the board, and the team building smart electric mobility.",
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
