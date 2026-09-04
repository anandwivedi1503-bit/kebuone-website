import type { Metadata } from "next";

import Navbar from "../../Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ChannelApplyForm from "../../components/DealerDistributorForms/ChannelApplyForm";

export const metadata: Metadata = {
  title: "Become an EVUDDY Dealer | EVUDDY",
  description:
    "Apply to retail EVUDDY electric scooters from ₹5 lakh. City showroom, GST invoices and hub OTP on the EVUDDY platform.",
};

export default function DealerApplyPage() {
  return (
    <main>
      <Navbar />
      <ChannelApplyForm channel="dealer" />
      <Footer />
    </main>
  );
}
