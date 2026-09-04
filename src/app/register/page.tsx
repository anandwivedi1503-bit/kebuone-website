import Navbar from "../Navbar/Navbar";
import RiderFormV2 from "../components/RiderForm/RiderFormV2";
import Footer from "../components/Footer/Footer";

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 sm:pt-40">
        <RiderFormV2 />
      </div>
      <Footer />
    </main>
  );
}