import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Leadership from "../components/Leadership/Leadership";

export const metadata: Metadata = {
  title: "Leadership | EVUDDY by Kebu One",
  description:
    "Meet Sunil Pathak, Founder and CEO of Shubhrax Mobility Ltd, and the leadership behind EVUDDY smart electric mobility.",
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
