import Navbar from "../Navbar/Navbar";
import AnchorScroll from "../components/AnchorScroll/AnchorScroll";
import FleetPartnerInvestment from "../components/FleetPartnerInvestment/FleetPartnerInvestment";
import PartnerSpotlight from "../components/PartnerSpotlight/PartnerSpotlight";
import PartnerForm from "../components/PartnerForm/PartnerForm";
import Footer from "../components/Footer/Footer";

export default function PartnersPage() {
  return (
    <main>
      <AnchorScroll />
      <Navbar />
      <div className="page-under-nav">
        <PartnerSpotlight />
        <FleetPartnerInvestment posterPriority />
        <PartnerForm />
      </div>
      <Footer />
    </main>
  );
}
