import Navbar from "../Navbar/Navbar";
import RiderFormV2 from "../components/RiderForm/RiderFormV2";
import Footer from "../components/Footer/Footer";

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <div className="page-under-nav">
        <RiderFormV2 />
      </div>
      <Footer />
    </main>
  );
}