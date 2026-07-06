import Navbar from "../Navbar/Navbar";
import Careers from "../components/Careers/Careers";
import Footer from "../components/Footer/Footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <Careers />
      </div>
      <Footer />
    </main>
  );
}