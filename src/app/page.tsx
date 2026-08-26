import Navbar from "./Navbar/Navbar";
import AnchorScroll from "./components/AnchorScroll/AnchorScroll";
import Hero from "./components/Hero/Hero";
import EvuddyNetwork from "./components/EvuddyNetwork/EvuddyNetwork";
import Services from "./components/Services/Services";
import WhyKebu from "./components/WhyKebu/WhyKebu";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Stats from "./components/Stats/Stats";
import Testimonials from "./components/Testimonials/Testimonials";
import FleetPartnerInvestment from "./components/FleetPartnerInvestment/FleetPartnerInvestment";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
      <main>
            <AnchorScroll />
            <Navbar />

                  <Hero />
                  <EvuddyNetwork />
                  <Services />


                  <WhyKebu />
                  <FleetPartnerInvestment />
                  <HowItWorks />



                  <Stats />
                  <Testimonials />

                  <Footer />
                      </main>
                        );
                        }