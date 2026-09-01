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

import { auth } from "@/lib/firebase";
import {
  getChosenPlan,
  getRiderProfile,
  hasRiderPlanReady,
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
  const [chosenPlan, setChosenPlanUi] = useState("");
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
      const profile = getRiderProfile();
      setChosenPlanUi(getChosenPlan());
      setResumeHref(riderResumeHref());
      setRiderLoggedIn(hasRiderPlanReady() || Boolean(profile.phone));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      refreshSession();
      if (user?.phoneNumber) {
        setRiderLoggedIn(true);
      }
    });

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
top-3
lg:top-4
left-1/2
-translate-x-1/2
z-[999]
w-[calc(100%-16px)]
sm:w-[calc(100%-24px)]
max-w-[1700px]
transition-all
duration-500
${
isScrolled
? "bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_18px_60px_rgba(2,12,27,0.10)]rounded-xl lg:rounded-2xl"
: "bg-white/55 backdrop-blur-2xl border border-white/40 rounded-xl lg:rounded-2xl"}
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
h-[64px]
sm:h-[74px]
lg:h-[90px]
px-3
sm:px-5
lg:px-6
xl:px-8
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
w-[128px]
sm:w-[175px]
xl:w-[190px]
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
h-[40px]
sm:h-[52px]
lg:h-[58px]
xl:h-[60px]
w-auto
object-contain
transition-all
duration-500
group-hover:scale-[1.04]
"
/>

</Link>


{/* ================= Desktop Menu ================= */}

<div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-10">

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
text-[17px]
font-semibold
tracking-[-0.01em]
whitespace-nowrap
text-[#0F172A]
transition-all
duration-300
hover:text-[#18B368]
hover:-translate-y-[1px]
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

<div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 ml-3 xl:ml-5">

{!(riderLoggedIn || chosenPlan) && (
<>
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
px-4
xl:px-5
h-12
xl:h-13
font-bold
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
rounded-full
bg-[#EC2A8C]
px-4
xl:px-5
h-12
xl:h-13
font-bold
text-white
shadow-[0_14px_40px_rgba(236,42,140,0.35)]
transition-all
duration-300
hover:-translate-y-1
hover:bg-[#d01878]
hover:shadow-[0_22px_55px_rgba(236,42,140,0.45)]
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
rounded-full
bg-gradient-to-r
from-[#18B368]
via-[#16C45B]
to-[#13A657]
px-4
xl:px-5
h-12
xl:h-13
font-bold
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
</>
)}

{(riderLoggedIn || chosenPlan) && <RiderAccountMenu />}

</div>

{/* ================= Mobile Button ================= */}

<div className="flex items-center gap-2 lg:hidden">
{(riderLoggedIn || chosenPlan) && <RiderAccountMenu compact />}
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

{(riderLoggedIn || chosenPlan) ? (
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
bg-[#EC2A8C]
text-white
font-semibold
transition-all
duration-300
hover:bg-[#d01878]
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