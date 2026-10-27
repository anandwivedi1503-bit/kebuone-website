import Navbar from "../Navbar/Navbar";
import RiderFormV2 from "../components/RiderForm/RiderFormV2";
import OperatingCitiesNotice from "../components/Brand/OperatingCitiesNotice";
import Footer from "../components/Footer/Footer";

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <div className="page-under-nav rider-flow-shell">
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <OperatingCitiesNotice />
        </div>
        <RiderFormV2 />
      </div>
      <Footer />
    </main>
  );
}