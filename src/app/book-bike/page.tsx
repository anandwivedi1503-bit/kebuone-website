import Navbar from "../Navbar/Navbar";
import BikeBooking from "../components/BikeBooking/BikeBooking";
import Footer from "../components/Footer/Footer";

export default function BookBikePage() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <BikeBooking />
      </div>
      <Footer />
    </main>
  );
}