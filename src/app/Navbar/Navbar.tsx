"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Menu,
  X,
  ChevronRight,
  Building2,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useState,
  useEffect,
} from "react";

const navLinks = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Fleet",
    href: "#fleet",
  },
  {
    title: "Corporate",
    href: "#corporate",
  },
  {
    title: "How It Works",
    href: "#how-it-works",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 30);

    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  useEffect(() => {

    if (menuOpen) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "auto";

    }

    return () => {

      document.body.style.overflow = "auto";

    };

  }, [menuOpen]);

  

  return (

<nav
className={`
fixed
top-4
left-1/2
-translate-x-1/2
z-[999]
w-[calc(100%-24px)]
max-w-[1620px]
transition-all
duration-500
${
isScrolled
? "bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_25px_70px_rgba(15,23,42,0.10)] rounded-2xl"
: "bg-white/55 backdrop-blur-2xl border border-white/40 rounded-2xl"
}
`}
>

{/* Premium Bottom Highlight */}

<div
className="
absolute
bottom-0
left-1/2
-translate-x-1/2
h-px
w-[92%]
bg-gradient-to-r
from-transparent
via-[#18B368]/20
to-[#EC2A8C]/20
"
/>

<div
className="
relative
max-w-[1650px]
mx-auto
flex
items-center
justify-between
h-[82px]
px-8
xl:px-12
"
>
{/* ================= Logo ================= */}

<Link
href="/"
className="
flex
items-center
shrink-0
w-[290px]
group
"
>

<Image
src="/Evuddy-logo-dark-E.png"
alt="EVUDDY"
width={320}
height={95}
priority
className="
h-14
w-auto
object-contain
transition-transform
duration-500
group-hover:scale-[1.02]
"
/>

</Link>


{/* ================= Desktop Menu ================= */}

<div className="hidden lg:flex flex-1 items-center justify-center gap-12">

{navLinks.map((item)=>(

<Link
key={item.title}
href={item.href}
className="
group
relative
py-2
text-[16px]
font-medium
tracking-[0.01em]
text-gray-800
transition-colors
duration-300
hover:text-[#18B368]
"
>

{item.title}

<span
className="
absolute
left-0
-bottom-[6px]
h-[2px]
w-0
rounded-full
bg-gradient-to-r
from-[#18B368]
via-[#45D98C]
to-[#EC2A8C]
transition-all
duration-300
group-hover:w-full
"
/>

</Link>

))}

</div>

{/* ================= Right Buttons ================= */}

<div className="hidden lg:flex items-center gap-5 shrink-0 ml-10">

<Link href="/partners">

<button
className="
flex
items-center
gap-2
rounded-full
border
border-[#18B368]/20
bg-white/80
backdrop-blur-xl
px-7
py-3
font-semibold
text-[#18B368]
shadow-[0_12px_35px_rgba(15,23,42,0.08)]
transition-all
duration-300
hover:-translate-y-1
hover:border-[#18B368]
hover:bg-[#18B368]
hover:text-white
hover:shadow-[0_18px_45px_rgba(24,179,104,0.25)]
"
>

<Building2 size={18} />

Become a Partner

</button>

</Link>


<Link href="/register">

<button
className="
group
flex
items-center
gap-2
rounded-full
bg-gradient-to-r
from-[#18B368]
via-[#16C45B]
to-[#13A657]
px-7
py-3
font-semibold
text-white
shadow-[0_14px_40px_rgba(24,179,104,0.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_22px_55px_rgba(24,179,104,0.45)]
active:scale-[0.98]
"
>

Book EV

<ChevronRight
size={18}
className="transition-transform duration-300 group-hover:translate-x-1"
/>

</button>

</Link>

</div>

{/* ================= Mobile Button ================= */}

<button

onClick={()=>setMenuOpen(!menuOpen)}

className={`lg:hidden transition

${

isScrolled

? "text-gray-900"

: "text-white"

}`}

>

{menuOpen ? (

<X size={32}/>

) : (

<Menu size={30}/>

)}

</button>

</div>

    {/* ================= Mobile Sidebar ================= */}

<AnimatePresence>

{menuOpen && (

<>

<motion.div
initial={{ opacity:0 }}
animate={{ opacity:1 }}
exit={{ opacity:0 }}
transition={{ duration:0.25 }}
onClick={()=>setMenuOpen(false)}
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
/>

<motion.div

initial={{ x:-420 }}

animate={{ x:0 }}

exit={{ x:-420 }}

transition={{
duration:0.45,
type:"spring",
stiffness:120
}}

className="fixed top-0 left-0 h-screen w-[88%] max-w-[360px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"

>

{/* ================= Header ================= */}

<div className="flex items-center justify-between px-6 py-6 border-b">

<Image
src="/Evuddy-logo-dark-E.png"
alt="EVUDDY"
width={180}
height={55}
className="h-11 w-auto"
/>

<button

onClick={()=>setMenuOpen(false)}

className="rounded-full p-2 hover:bg-gray-100 transition"

>

<X size={28} className="text-gray-800"/>

</button>

</div>

{/* ================= Links ================= */}

<div className="px-6 py-8 space-y-1">

{navLinks.map((item)=>(

<Link

key={item.title}

href={item.href}

onClick={()=>setMenuOpen(false)}

className="flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-600 transition"

>

{item.title}

<ChevronRight size={18}/>

</Link>

))}

</div>

{/* ================= CTA Section ================= */}

<div className="px-6 pb-10 space-y-4">

<Link
href="/franchise"
onClick={()=>setMenuOpen(false)}
>

<button

className="
w-full
h-14
rounded-full
border
border-[#18B368]/20
bg-white
text-[#18B368]
font-semibold
transition-all
duration-300
hover:bg-[#18B368]
hover:text-white
flex
items-center
justify-center
gap-2
"

>

<Building2 size={20}/>

Become a Partner

</button>

</Link>

<Link
href="/register"
onClick={()=>setMenuOpen(false)}
>

<button

className="w-full h-14 rounded-full bg-[#111827] text-white font-semibold hover:bg-black transition flex items-center justify-center gap-2"

>

Book Ride

<ChevronRight size={18}/>

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