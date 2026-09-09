"use client";

import Image from "next/image";
import Link from "next/link";
import {
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
import NavbarErrorBoundary from "./NavbarErrorBoundary";
import { useEffect, useState } from "react";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Careers", href: "/careers" },
  { title: "Leadership", href: "/Leadership" },
  { title: "Vision", href: "/vision" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

/** Physical handset, even if the browser is in “Desktop site” mode. */
function isHandsetScreen() {
  if (typeof window === "undefined") return false;
  const shortest = Math.min(window.screen.width, window.screen.height);
  const touch =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;
  return touch && shortest <= 850;
}

function NavbarInner() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [riderLoggedIn, setRiderLoggedIn] = useState(false);
  const [resumeHref, setResumeHref] = useState("/ride-options");
  const [compactNav, setCompactNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const apply = () => setCompactNav(isHandsetScreen());
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const refreshSession = () => {
      try {
        const signedIn = Boolean(firebaseAuth?.currentUser) && isRiderLoggedIn();
        setResumeHref(riderResumeHref());
        setRiderLoggedIn(signedIn);
      } catch {
        setRiderLoggedIn(false);
      }
    };
    let unsubscribe = () => {};
    try {
      unsubscribe = firebaseAuth
        ? onAuthStateChanged(firebaseAuth, () => refreshSession())
        : () => {};
    } catch {
      unsubscribe = () => {};
    }
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
      data-compact-nav={compactNav ? "true" : "false"}
      className={`fixed inset-x-0 top-0 z-[999] pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        isScrolled
          ? "border-b border-[#E4DDD2] bg-[#F7F4EE]/95 backdrop-blur-md"
          : "border-b border-transparent bg-[#F7F4EE]"
      }`}
    >
      <div className="hidden bg-[#1C3A2E] px-4 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 sm:block">
        GST invoice on rent · KYC-verified riders · Hub OTP pickup
      </div>

      <div className="relative mx-auto flex h-14 w-full max-w-[1650px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-20 flex shrink-0 items-center">
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={320}
            height={95}
            priority
            className="h-9 w-auto max-w-[132px] object-contain object-left sm:h-10 sm:max-w-[168px] min-[1280px]:h-11 min-[1280px]:max-w-[184px]"
          />
        </Link>

        <div className="nav-desktop-row shrink-0 items-center justify-center gap-[clamp(0.75rem,1.4vw,1.75rem)]">
          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap px-1 text-[clamp(13px,1.05vw,15px)] font-medium tracking-[0.04em] text-[#1C1917] transition-colors duration-300 hover:text-[#1F6B4A]"
            >
              <span>{item.title}</span>
              <span className="absolute -bottom-[4px] left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-[#18B368] via-[#45D98C] to-[#1F6B4A] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="nav-desktop-row shrink-0 items-center gap-[clamp(0.35rem,0.7vw,0.65rem)]">
          <Link
            href="/partners#dealer-network"
            className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-[clamp(0.5rem,0.9vw,0.9rem)] text-[clamp(13px,1.05vw,15px)] font-medium text-[#1F6B4A] transition-colors hover:text-[#18573c]"
          >
            <Building2 size={16} />
            Dealers
          </Link>
          {!riderLoggedIn && (
            <>
              <Link
                href="/partners"
                className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-[clamp(0.5rem,0.9vw,0.9rem)] text-[clamp(13px,1.05vw,15px)] font-medium text-[#1F6B4A] transition-colors hover:text-[#18573c]"
              >
                <Building2 size={16} />
                Fleet Partner
              </Link>
              <Link
                href="/partners#fleet-investment"
                className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-[clamp(0.5rem,0.9vw,0.9rem)] text-[clamp(13px,1.05vw,15px)] font-medium text-[#1F6B4A] transition-colors hover:text-[#18573c]"
              >
                <Wallet size={16} />
                Invest
              </Link>
              <Link
                href="/ride-options"
                className="group flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap bg-[#1F6B4A] px-4 text-[clamp(13px,1.05vw,15px)] font-medium tracking-[0.06em] text-white transition-colors hover:bg-[#18573c]"
              >
                Book EV
                <ChevronRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </>
          )}
          {riderLoggedIn && <RiderAccountMenu />}
        </div>

        <div className="nav-phone-toggle shrink-0 items-center gap-2">
          {riderLoggedIn && <RiderAccountMenu compact />}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="nav-burger relative z-[1001]"
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2.25} />
            ) : (
              <>
                <span />
                <span />
                <span />
              </>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
      <div className="nav-drawer-layer is-open">
        <button
          type="button"
          className="nav-drawer-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
        <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
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
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition hover:bg-[#18B368] hover:text-white"
                >
                  <Building2 size={20} />
                  Become a dealer
                </Link>
                <Link
                  href="/partners"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition hover:bg-[#18B368] hover:text-white"
                >
                  <Building2 size={20} />
                  Fleet Partner
                </Link>
                <Link
                  href="/partners#fleet-investment"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1F6B4A] font-semibold text-white transition hover:bg-[#18573c]"
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
        </div>
      </div>
      ) : null}
    </nav>
  );
}

export default function Navbar() {
  return (
    <NavbarErrorBoundary>
      <NavbarInner />
    </NavbarErrorBoundary>
  );
}
