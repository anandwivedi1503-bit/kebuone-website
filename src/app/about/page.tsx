import Navbar from "../Navbar/Navbar";
import AboutUs from "../components/AboutUs/AboutUs";
import Footer from "../components/Footer/Footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <AboutUs />
      </div>
      <Footer />
    </main>
  );
}