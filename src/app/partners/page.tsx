import Navbar from "../Navbar/Navbar";
import AnchorScroll from "../components/AnchorScroll/AnchorScroll";
import FleetPartnerInvestment from "../components/FleetPartnerInvestment/FleetPartnerInvestment";
import PartnerForm from "../components/PartnerForm/PartnerForm";
import Footer from "../components/Footer/Footer";

export default function PartnersPage() {
  return (
    <main>
      <AnchorScroll />
      <Navbar />
      <div className="pt-28">
        <FleetPartnerInvestment posterPriority />
        <PartnerForm />
      </div>
      <Footer />
    </main>
  );
}