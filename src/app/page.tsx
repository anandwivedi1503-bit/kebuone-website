import dynamic from "next/dynamic";

import Navbar from "./Navbar/Navbar";
import AnchorScroll from "./components/AnchorScroll/AnchorScroll";
import HomeScrollLine from "./components/HomeScrollLine/HomeScrollLine";
import Hero from "./components/Hero/Hero";
import HomePartners from "./components/HomePartners/HomePartners";
import HomeTrustBar from "./components/HomeTrustBar/HomeTrustBar";
import HomeFilm from "./components/HomeFilm/HomeFilm";
import HomePlans from "./components/HomePlans/HomePlans";
import Footer from "./components/Footer/Footer";

const EvuddyNetwork = dynamic(() => import("./components/EvuddyNetwork/EvuddyNetwork"));
const HomeMoment = dynamic(() => import("./components/HomeMoment/HomeMoment"));
const Services = dynamic(() => import("./components/Services/Services"));
const HomeStill = dynamic(() => import("./components/HomeStill/HomeStill"));
const HomePlaces = dynamic(() => import("./components/HomePlaces/HomePlaces"));
const WhyKebu = dynamic(() => import("./components/WhyKebu/WhyKebu"));
const InvestHomeInvite = dynamic(() => import("./components/InvestHomeInvite/InvestHomeInvite"));
const DealerNetwork = dynamic(() => import("./components/DealerNetwork/DealerNetwork"));
const HowItWorks = dynamic(() => import("./components/HowItWorks/HowItWorks"));
const Stats = dynamic(() => import("./components/Stats/Stats"));
const Testimonials = dynamic(() => import("./components/Testimonials/Testimonials"));

export default function Home() {
  return (
    <main>
      <AnchorScroll />
      <HomeScrollLine />
      <Navbar />
      <Hero />
      <HomePartners />
      <HomeTrustBar />
      <HomeFilm />
      <HomePlans />
      <EvuddyNetwork />
      <HomeMoment />
      <Services />
      <HomeStill />
      <HomePlaces />
      <WhyKebu />
      <InvestHomeInvite />
      <DealerNetwork />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Footer />
    </main>
  );
}
