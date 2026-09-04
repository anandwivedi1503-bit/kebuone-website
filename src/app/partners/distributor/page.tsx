import type { Metadata } from "next";

import Navbar from "../../Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ChannelApplyForm from "../../components/DealerDistributorForms/ChannelApplyForm";

export const metadata: Metadata = {
  title: "Become an EVUDDY Distributor | EVUDDY",
  description:
    "Apply to distribute EVUDDY scooters to authorised dealers from ₹10 lakh. Territory warehouse and dealer onboarding.",
};

export default function DistributorApplyPage() {
  return (
    <main>
      <Navbar />
      <ChannelApplyForm channel="distributor" />
      <Footer />
    </main>
  );
}
