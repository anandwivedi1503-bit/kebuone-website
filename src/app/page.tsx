import Navbar from "./Navbar/Navbar";
import AnchorScroll from "./components/AnchorScroll/AnchorScroll";
import HomeScrollLine from "./components/HomeScrollLine/HomeScrollLine";
import Hero from "./components/Hero/Hero";
import HomePartners from "./components/HomePartners/HomePartners";
import HomeTrustBar from "./components/HomeTrustBar/HomeTrustBar";
import EvuddyNetwork from "./components/EvuddyNetwork/EvuddyNetwork";
import HomeMoment from "./components/HomeMoment/HomeMoment";
import HomeFilm from "./components/HomeFilm/HomeFilm";
import Services from "./components/Services/Services";
import HomePlans from "./components/HomePlans/HomePlans";
import HomeStill from "./components/HomeStill/HomeStill";
import WhyKebu from "./components/WhyKebu/WhyKebu";
import InvestHomeInvite from "./components/InvestHomeInvite/InvestHomeInvite";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Stats from "./components/Stats/Stats";
import Testimonials from "./components/Testimonials/Testimonials";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <main>
      <AnchorScroll />
      <HomeScrollLine />
      <Navbar />
      <Hero />
      <HomePartners />
      <HomeTrustBar />
      <EvuddyNetwork />
      <HomeMoment />
      <HomeFilm />
      <HomePlans />
      <Services />
      <HomeStill />
      <WhyKebu />
      <InvestHomeInvite />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Footer />
    </main>
  );
}
