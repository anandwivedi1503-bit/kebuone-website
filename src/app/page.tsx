import Navbar from "./Navbar/Navbar";
import AnchorScroll from "./components/AnchorScroll/AnchorScroll";
import Hero from "./components/Hero/Hero";
import HomeTrustBar from "./components/HomeTrustBar/HomeTrustBar";
import EvuddyNetwork from "./components/EvuddyNetwork/EvuddyNetwork";
import Services from "./components/Services/Services";
import HomePlans from "./components/HomePlans/HomePlans";
import WhyKebu from "./components/WhyKebu/WhyKebu";
import InvestHomeInvite from "./components/InvestHomeInvite/InvestHomeInvite";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Stats from "./components/Stats/Stats";
import Testimonials from "./components/Testimonials/Testimonials";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <main className="bg-[#06140F]">
      <AnchorScroll />
      <Navbar />
      <Hero />
      <HomeTrustBar />
      <EvuddyNetwork />
      <HomePlans />
      <Services />
      <WhyKebu />
      <InvestHomeInvite />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Footer />
    </main>
  );
}
