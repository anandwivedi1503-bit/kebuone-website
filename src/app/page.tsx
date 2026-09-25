import Navbar from "./Navbar/Navbar";
import AnchorScroll from "./components/AnchorScroll/AnchorScroll";
import HomeScrollLine from "./components/HomeScrollLine/HomeScrollLine";
import Hero from "./components/Hero/Hero";
import HomeTrustBar from "./components/HomeTrustBar/HomeTrustBar";
import HomePlans from "./components/HomePlans/HomePlans";
import PartnerSpotlight from "./components/PartnerSpotlight/PartnerSpotlight";
import Footer from "./components/Footer/Footer";
import dynamic from "next/dynamic";

const EvuddyNetwork = dynamic(() => import("./components/EvuddyNetwork/EvuddyNetwork"));
const Services = dynamic(() => import("./components/Services/Services"));
const WhyKebu = dynamic(() => import("./components/WhyKebu/WhyKebu"));
const HowItWorks = dynamic(() => import("./components/HowItWorks/HowItWorks"));
const RiderReviews = dynamic(() => import("./components/RiderReviews/RiderReviews"));

export default function Home() {
  return (
    <main>
      <AnchorScroll />
      <HomeScrollLine />
      <Navbar />
      <Hero />
      <PartnerSpotlight />
      <HomePlans />
      <HomeTrustBar />
      <EvuddyNetwork />
      <Services />
      <WhyKebu />
      <HowItWorks />
      <RiderReviews />
      <Footer />
    </main>
  );
}
