"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Menu,
  X,
  ChevronRight,
  Building2,
  LogOut,
  Wallet,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase";
import {
  isRiderLoggedIn,
  logoutRider,
  riderResumeHref,
  RIDER_SESSION_EVENT,
} from "@/lib/riderPlanGate";
import RiderAccountMenu from "@/app/components/RiderSession/RiderAccountMenu";

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
    title: "Careers",
    href: "/careers",
  },
  {
    title: "Leadership",
    href: "/Leadership",
  },
  {
    title: "Vision",
    href: "/vision",
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

  const [riderLoggedIn, setRiderLoggedIn] = useState(false);
  const [resumeHref, setResumeHref] = useState("/ride-options");

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

  useEffect(() => {
    const refreshSession = () => {
      const signedIn =
        Boolean(firebaseAuth?.currentUser) && isRiderLoggedIn();
      setResumeHref(riderResumeHref());
      setRiderLoggedIn(signedIn);
    };

    const unsubscribe = firebaseAuth
      ? onAuthStateChanged(firebaseAuth, () => {
          refreshSession();
        })
      : () => {};

    window.addEventListener(RIDER_SESSION_EVENT, refreshSession);
    window.addEventListener("storage", refreshSession);
    refreshSession();

    return () => {
      unsubscribe();
      window.removeEventListener(RIDER_SESSION_EVENT, refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutRider();
  };



  return (

<nav
className={`
fixed
inset-x-0
top-0
z-[999]
overflow-visible
transition-colors
duration-300
${
isScrolled
? "border-b border-[#E4DDD2] bg-[#F7F4EE]/95 backdrop-blur-md"
: "border-b border-transparent bg-[#F7F4EE]"}
`}
>

<div className="hidden bg-[#1C3A2E] py-2 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/90 sm:block">
  GST invoice on rent · KYC-verified riders · Hub OTP pickup
</div>

<div
className="
relative
max-w-[1650px]
mx-auto
flex
items-center
justify-between
min-h-[64px]
sm:min-h-[74px]
lg:min-h-[82px]
gap-3
px-3
sm:px-5
lg:px-6
xl:px-8
py-2
"
>
{/* ================= Logo ================= */}

<Link
href="/"
className="
flex
items-center
justify-start
shrink-0
max-w-[150px]
sm:max-w-[190px]
xl:max-w-[210px]
"
>

<Image
src="/Evuddy-logo-dark-E.png"
alt="EVUDDY"
width={320}
height={95}
priority
className="
h-[36px]
sm:h-[46px]
lg:h-[50px]
xl:h-[52px]
w-auto
max-w-full
object-contain
object-left
"
/>

</Link>


{/* ================= Desktop Menu ================= */}

<div className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-4 xl:gap-8">

{navLinks.map((item)=>(

<Link
key={item.title}
href={item.href}
className="
group
relative
inline-flex
items-center
justify-center
h-12
px-1
text-[13px]
xl:text-[15px]
font-medium
tracking-[0.04em]
whitespace-nowrap
text-[#1C1917]
transition-colors
duration-300
hover:text-[#1F6B4A]
"
>

<span className="whitespace-nowrap">
  {item.title}
</span>

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
to-[#1F6B4A]
transition-all
duration-300
group-hover:w-full
"
/>

</Link>

))}

</div>

{/* ================= Right Buttons ================= */}

<div className="hidden lg:flex shrink-0 items-center gap-1 xl:gap-3 ml-2 xl:ml-5">

{!riderLoggedIn && (
<>
<Link href="/partners">

<button
className="
flex
items-center
gap-2
h-11
whitespace-nowrap
px-3
xl:px-5
font-medium
text-[#1F6B4A]
transition-colors
duration-300
hover:text-[#18573c]
"
>

<Building2 size={18} />

Fleet Partner

</button>

</Link>

<Link href="/partners#fleet-investment">

<button
type="button"
className="
flex
items-center
gap-2
h-11
whitespace-nowrap
px-3
xl:px-5
font-medium
text-[#1F6B4A]
transition-colors
duration-300
hover:text-[#18573c]
"

>

<Wallet size={18} />

Invest

</button>

</Link>

<Link href="/ride-options">

<button
className="
group
flex
items-center
gap-2
h-11
whitespace-nowrap
px-4
xl:px-6
bg-[#1F6B4A]
font-medium
tracking-[0.06em]
text-white
transition-colors
duration-300
hover:bg-[#18573c]
"
>

Book EV

<ChevronRight
size={18}
className="transition-transform duration-300 group-hover:translate-x-1"
/>

</button>

</Link>
</>
)}

{riderLoggedIn && <RiderAccountMenu />}

</div>

{/* ================= Mobile Button ================= */}

<div className="flex items-center gap-2 lg:hidden">
{riderLoggedIn && <RiderAccountMenu compact />}
<button
onClick={() => setMenuOpen(!menuOpen)}
className="
relative
z-[1001]
p-2
text-[#0F172A]
transition-all
duration-300
"
>

{menuOpen ? (

<X size={32}/>

) : (

<Menu size={30}/>

)}

</button>
</div>

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

<div className="flex items-center justify-between px-4
lg:px-6 py-6 border-b">

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

<div className="px-4
lg:px-6 py-8 space-y-1">

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

<div className="px-4
lg:px-6 pb-10 space-y-4">

{riderLoggedIn ? (
<>
  <Link
    href={resumeHref}
    onClick={()=>setMenuOpen(false)}
    className="flex w-full items-center justify-center gap-2 h-14 rounded-full bg-[#111827] text-white font-semibold"
  >
    Continue my ride
    <ChevronRight size={18}/>
  </Link>
  <button
    type="button"
    onClick={handleLogout}
    className="w-full h-14 rounded-full border border-[#EC2A8C]/30 bg-white text-[#EC2A8C] font-semibold flex items-center justify-center gap-2"
  >
    <LogOut size={18} />
    Log out
  </button>
</>
) : (
<>
<Link
href="/partners"
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

Fleet Partner 

</button>

</Link>

<Link
href="/partners#fleet-investment"
onClick={()=>setMenuOpen(false)}
>

<button
type="button"
className="
w-full
h-14
rounded-full
bg-[#1F6B4A]
text-white
font-semibold
transition-all
duration-300
hover:bg-[#18573c]
flex
items-center
justify-center
gap-2
"
>

<Wallet size={20}/>

Invest

</button>

</Link>

<Link
href="/ride-options"
onClick={()=>setMenuOpen(false)}
>

<button

className="w-full h-14 rounded-full bg-[#111827] text-white font-semibold hover:bg-black transition flex items-center justify-center gap-2"

>

Book Ride

<ChevronRight size={18}/>

</button>

</Link>
</>
)}

</div>

</motion.div>

</>

)}

</AnimatePresence>

</nav>
  );
}