import Navbar from "../Navbar/Navbar";
import AnchorScroll from "../components/AnchorScroll/AnchorScroll";
import FleetPartnerInvestment from "../components/FleetPartnerInvestment/FleetPartnerInvestment";
import DealerNetwork from "../components/DealerNetwork/DealerNetwork";
import PartnerForm from "../components/PartnerForm/PartnerForm";
import Footer from "../components/Footer/Footer";

export default function PartnersPage() {
  return (
    <main>
      <AnchorScroll />
      <Navbar />
      <div className="page-under-nav">
        <DealerNetwork />
        <FleetPartnerInvestment posterPriority />
        <PartnerForm />
      </div>
      <Footer />
    </main>
  );
}
