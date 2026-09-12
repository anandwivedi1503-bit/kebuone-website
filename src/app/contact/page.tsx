import Navbar from "../Navbar/Navbar";
import ContactUs from "../components/ContactUs/ContactUs";
import Footer from "../components/Footer/Footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="page-under-nav">
        <ContactUs />
      </div>
      <Footer />
    </main>
  );
}