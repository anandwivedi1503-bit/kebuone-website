import Navbar from "../Navbar/Navbar";
import VisionMission from "../components/VisionMission/VisionMission";
import Footer from "../components/Footer/Footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <VisionMission />
      </div>
      <Footer />
    </main>
  );
}