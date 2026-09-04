import type { Metadata } from "next";

import Navbar from "../Navbar/Navbar";
import VisionMission from "../components/VisionMission/VisionMission";
import Footer from "../components/Footer/Footer";

export const metadata: Metadata = {
  title: "Vision | EVUDDY",
  description:
    "EVUDDY's mission is affordable, accessible, asset-building electric mobility. Our vision is a future where every ride can lead to ownership.",
};

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 sm:pt-40">
        <VisionMission />
      </div>
      <Footer />
    </main>
  );
}
