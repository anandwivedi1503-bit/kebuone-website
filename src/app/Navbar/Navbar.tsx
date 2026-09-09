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
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Careers", href: "/careers" },
  { title: "Leadership", href: "/Leadership" },
  { title: "Vision", href: "/vision" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const linkClass =
  "group relative inline-flex h-12 shrink-0 items-center justify-center px-2 text-[15px] font-medium tracking-[0.04em] whitespace-nowrap text-[#1C1917] transition-colors duration-300 hover:text-[#1F6B4A]";

const textBtnClass =
  "flex h-11 shrink-0 items-center gap-2 whitespace-nowrap px-3 text-[15px] font-medium text-[#1F6B4A] transition-colors duration-300 hover:text-[#18573c] 2xl:px-5";

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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const refreshSession = () => {
      const signedIn = Boolean(firebaseAuth?.currentUser) && isRiderLoggedIn();
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
      className={`fixed inset-x-0 top-0 z-[999] overflow-x-clip transition-colors duration-300 ${
        isScrolled
          ? "border-b border-[#E4DDD2] bg-[#F7F4EE]/95 backdrop-blur-md"
          : "border-b border-transparent bg-[#F7F4EE]"
      }`}
    >
      <div className="hidden bg-[#1C3A2E] px-4 py-2 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.14em] text-white/90 sm:block sm:tracking-[0.18em] xl:tracking-[0.22em]">
        GST invoice on rent · KYC-verified riders · Hub OTP pickup
      </div>

      <div className="relative mx-auto grid min-h-[64px] w-full max-w-[1650px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:min-h-[74px] sm:px-5 lg:min-h-[82px] lg:px-6 xl:gap-6 xl:px-8">
        <Link
          href="/"
          className="relative z-20 flex max-w-[150px] shrink-0 items-center justify-start sm:max-w-[190px] xl:max-w-[210px]"
        >
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={320}
            height={95}
            priority
            className="h-[36px] w-auto max-w-full object-contain object-left sm:h-[46px] xl:h-[52px]"
          />
        </Link>

        <div className="hidden min-w-0 items-center justify-center gap-6 xl:flex 2xl:gap-8">
          {navLinks.map((item) => (
            <Link key={item.title} href={item.href} className={linkClass}>
              <span className="whitespace-nowrap">{item.title}</span>
              <span className="absolute -bottom-[6px] left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-[#18B368] via-[#45D98C] to-[#1F6B4A] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden min-w-0 shrink-0 items-center justify-end gap-3 xl:ml-4 xl:flex 2xl:ml-5 2xl:gap-4">
          <Link href="/partners#dealer-network" className={textBtnClass}>
            <Building2 size={18} />
            Dealers
          </Link>

          {!riderLoggedIn && (
            <>
              <Link href="/partners" className={textBtnClass}>
                <Building2 size={18} />
                Fleet Partner
              </Link>

              <Link href="/partners#fleet-investment" className={textBtnClass}>
                <Wallet size={18} />
                Invest
              </Link>

              <Link
                href="/ride-options"
                className="group flex h-11 shrink-0 items-center gap-2 whitespace-nowrap bg-[#1F6B4A] px-5 text-[15px] font-medium tracking-[0.06em] text-white transition-colors duration-300 hover:bg-[#18573c] 2xl:px-6"
              >
                Book EV
                <ChevronRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </>
          )}

          {riderLoggedIn && <RiderAccountMenu />}
        </div>

        <div className="col-start-3 flex items-center justify-end gap-2 xl:hidden">
          {riderLoggedIn && <RiderAccountMenu compact />}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative z-[1001] p-2 text-[#0F172A] transition-all duration-300"
          >
            {menuOpen ? <X size={32} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
            />

            <motion.div
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ duration: 0.45, type: "spring", stiffness: 120 }}
              className="fixed top-0 left-0 z-50 h-screen w-[88%] max-w-[360px] overflow-y-auto bg-white shadow-2xl xl:hidden"
            >
              <div className="flex items-center justify-between border-b px-4 py-6">
                <Image
                  src="/Evuddy-logo-dark-E.png"
                  alt="EVUDDY"
                  width={180}
                  height={55}
                  className="h-11 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-2 transition hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={28} className="text-gray-800" />
                </button>
              </div>

              <div className="space-y-1 px-4 py-8">
                {navLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-gray-800 transition hover:bg-green-50 hover:text-green-600"
                  >
                    {item.title}
                    <ChevronRight size={18} />
                  </Link>
                ))}
              </div>

              <div className="space-y-4 px-4 pb-10">
                {riderLoggedIn ? (
                  <>
                    <Link
                      href={resumeHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#111827] font-semibold text-white"
                    >
                      Continue my ride
                      <ChevronRight size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#EC2A8C]/30 bg-white font-semibold text-[#EC2A8C]"
                    >
                      <LogOut size={18} />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/partners#dealer-network"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition-all duration-300 hover:bg-[#18B368] hover:text-white"
                    >
                      <Building2 size={20} />
                      Become a dealer
                    </Link>
                    <Link
                      href="/partners"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition-all duration-300 hover:bg-[#18B368] hover:text-white"
                    >
                      <Building2 size={20} />
                      Fleet Partner
                    </Link>
                    <Link
                      href="/partners#fleet-investment"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1F6B4A] font-semibold text-white transition-all duration-300 hover:bg-[#18573c]"
                    >
                      <Wallet size={20} />
                      Invest
                    </Link>
                    <Link
                      href="/ride-options"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#111827] font-semibold text-white transition hover:bg-black"
                    >
                      Book Ride
                      <ChevronRight size={18} />
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
