import Navbar from "../Navbar/Navbar";
import FleetPartnerInvestment from "../components/FleetPartnerInvestment/FleetPartnerInvestment";
import PartnerForm from "../components/PartnerForm/PartnerForm";
import Footer from "../components/Footer/Footer";

export default function PartnersPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-28">
        <FleetPartnerInvestment ctaHref="#partner-form" />
        <PartnerForm />
      </div>
      <Footer />
    </main>
  );
}