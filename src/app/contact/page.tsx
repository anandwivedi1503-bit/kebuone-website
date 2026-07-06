import Navbar from "../Navbar/Navbar";
import ContactUs from "../components/ContactUs/ContactUs";
import Footer from "../components/Footer/Footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <ContactUs />
      </div>
      <Footer />
    </main>
  );
}