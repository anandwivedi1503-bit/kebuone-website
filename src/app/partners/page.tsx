import Navbar from "../Navbar/Navbar";
import PartnerForm from "../components/PartnerForm/PartnerForm";
import Footer from "../components/Footer/Footer";

export default function PartnersPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <PartnerForm />
      </div>
      <Footer />
    </main>
  );
}