import Navbar from "./Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Services from "./components/Services/Services";
import WhyKebu from "./components/WhyKebu/WhyKebu";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Stats from "./components/Stats/Stats";
import Testimonials from "./components/Testimonials/Testimonials";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
      <main>
            <Navbar />

                  <Hero />
                  <Services />


                  <WhyKebu />
                  <HowItWorks />



                  <Stats />
                  <Testimonials />

                  <Footer />
                      </main>
                        );
                        }