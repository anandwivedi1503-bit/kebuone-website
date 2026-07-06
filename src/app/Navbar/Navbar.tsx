"use client";

import Image from "next/image";
import Link from "next/link";

import {
Menu,
X,
Download,
Handshake,
ArrowRight
} from "lucide-react";

import {
motion,
AnimatePresence
} from "framer-motion";

import {
useState,
useEffect
} from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] =
useState(false);

const [isScrolled, setIsScrolled] =
useState(false);

useEffect(() => {

const handleScroll = () => {

setIsScrolled(
window.scrollY > 25
);

};

window.addEventListener(
"scroll",
handleScroll
);

return () =>
window.removeEventListener(
"scroll",
handleScroll
);

}, []);

useEffect(() => {

if(menuOpen){

document.body.classList.add("menu-open");

}else{

document.body.classList.remove("menu-open");

}

return ()=>{

document.body.classList.remove("menu-open");

};

}, [menuOpen]);

const handleDownloadApp = () => {
  alert(
    "🚀 Kebu One App will be launching soon. Stay tuned for updates."
  );
};

  return (
    <nav
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
    isScrolled
      ? "bg-black/90 backdrop-blur-2xl shadow-lg border-b border-gray-800"
      : "bg-gradient-to-r from-[#D6006E] via-[#FF165E] to-[#FF5556]"
  }`}
>
  <div className="max-w-7xl mx-auto h-20 px-5 lg:px-8 flex items-center justify-between">

    {/* Logo */}

    <Link href="/" className="flex items-center">
      <Image
  src="/kebu_1-removebg-preview.png"
  alt="Kebu One"
  width={180}
  height={60}
  priority
  style={{ width: "auto", height: "40px" }}
/>
    </Link>

    {/* Desktop Menu */}

    <div className="hidden lg:flex items-center gap-10">

      <Link
        href="/"
        className={`font-semibold transition ${
          isScrolled ? "text-white" : "text-white"
        }`}
      >
        Home
      </Link>

      <a
        href="#services"
        className={`font-semibold transition ${
          isScrolled ? "text-white" : "text-white"
        }`}
      >
        Services
      </a>

      <Link
        href="/about"
        className={`font-semibold transition ${
          isScrolled ? "text-white" : "text-white"
        }`}
      >
        About
      </Link>

      <Link
        href="/careers"
        className={`font-semibold transition ${
          isScrolled ? "text-white" : "text-white"
        }`}
      >
        Careers
      </Link>

      <Link
        href="/contact"
        className={`font-semibold transition ${
          isScrolled ? "text-white" : "text-white"
        }`}
      >
        Contact
      </Link>

    </div>

    {/* Right Buttons */}

    <div className="hidden lg:flex items-center gap-4">

      <Link href="/partners">

        <button
className={`px-5 py-3 rounded-xl font-semibold transition border ${
isScrolled
? "border-[#FF165E] text-[#FF165E] hover:bg-[#FF165E] hover:text-white"
: "border-white text-white hover:bg-white hover:text-[#FF165E]"
}`}
>

Become Partner

</button>

      </Link>

      <button
        onClick={handleDownloadApp}
        className="bg-[#EEB440] text-[#0A1134] px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
      >
        Download App
      </button>

      <Link href="/register">

        <button className="bg-[#FF165E] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition">

          Book Now

          <ArrowRight size={18} />

        </button>

      </Link>

    </div>

    {/* Mobile Button */}

<button
  onClick={() => setMenuOpen(!menuOpen)}
  className={`lg:hidden p-2 rounded-xl ${
isScrolled ? "text-white" : "text-white"
}`}
>
  {menuOpen ? <X size={30} /> : <Menu size={30} />}
</button>

</div>

{/* Mobile Sidebar */}

<AnimatePresence>

{menuOpen && (

<>

<motion.div
initial={{ opacity:0 }}
animate={{ opacity:1 }}
exit={{ opacity:0 }}
onClick={()=>setMenuOpen(false)}
className="fixed inset-0 bg-black/60 z-40 lg:hidden"
/>

<motion.div
initial={{ x:-350 }}
animate={{ x:0 }}
exit={{ x:-350 }}
transition={{
duration:0.45,
type:"spring",
stiffness:120
}}
className="fixed top-0 left-0 h-screen w-[82%] max-w-[340px] bg-[#0A1134]/95 backdrop-blur-2xl rounded-r-3xl shadow-2xl z-50 lg:hidden"
>

<div className="flex items-center justify-between p-6 border-b border-white/10">

<Image
  src="/kebu_1-removebg-preview.png"
  alt="logo"
  width={180}
  height={60}
  style={{ width: "auto", height: "40px" }}
/>

<button
onClick={()=>setMenuOpen(false)}
className="text-white text-lg font-medium hover:text-[#EEB440] transition"
>
<X size={28}/>
</button>

</div>

<div className="flex flex-col p-6 space-y-6">

<Link href="/" onClick={()=>setMenuOpen(false)} className="text-white">
Home
</Link>

<a href="#services" onClick={()=>setMenuOpen(false)} className="text-white">
Services
</a>

<Link href="/about" onClick={() => setMenuOpen(false)} className="text-white">
  About
</Link>

<Link href="/careers" onClick={() => setMenuOpen(false)} className="text-white">
  Careers
</Link>

<Link href="/contact" onClick={() => setMenuOpen(false)} className="text-white">
  Contact
</Link>

<Link href="/partners" onClick={() => setMenuOpen(false)}>
  <button className="mt-3 w-full h-12 rounded-xl bg-[#FF165E] text-white font-bold flex items-center justify-center gap-2">
    Become Partner
  </button>
</Link>

<Link href="/register" onClick={() => setMenuOpen(false)}>
  <button className="mt-3 w-full h-12 rounded-xl bg-white text-[#0A1134] font-bold flex items-center justify-center gap-2">
    Book Now
  </button>
</Link>

</div>

</motion.div>

</>

)}

</AnimatePresence>

</nav>
  );
}