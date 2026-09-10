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
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  const dpr = window.devicePixelRatio || 1;
  const shortest = Math.min(window.screen.width || 0, window.screen.height || 0);
  const shortestCss = shortest / dpr;
  const touch = navigator.maxTouchPoints > 0;
  return touch && (shortest <= 850 || shortestCss <= 480);
}

function NavbarInner() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [riderLoggedIn, setRiderLoggedIn] = useState(false);
  const [resumeHref, setResumeHref] = useState("/ride-options");
  const [compactNav, setCompactNav] = useState(false);

  useEffect(() => {
    const apply = () => {
      setCompactNav(window.innerWidth < 1280 || isHandsetScreen());
    };
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

  const closeMenu = () => {
    setMenuOpen(false);
    const checkbox = document.getElementById("evuddy-nav-menu");
    if (checkbox instanceof HTMLInputElement) checkbox.checked = false;
  };

  const handleLogout = async () => {
    closeMenu();
    await logoutRider();
  };

  return (
    <nav
      data-compact-nav={compactNav ? "true" : "false"}
      className="fixed inset-x-0 top-0 z-[1102] border-b border-[#E4DDD2] bg-white pt-[env(safe-area-inset-top)]"
    >
      <div className="nav-shell">
        <Link href="/" className="nav-logo">
          <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" />
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

        <div className="nav-phone-toggle">
          {riderLoggedIn && <RiderAccountMenu compact />}
          <input
            id="evuddy-nav-menu"
            type="checkbox"
            className="nav-menu-check"
            onChange={(event) => setMenuOpen(event.target.checked)}
          />
          <label htmlFor="evuddy-nav-menu" className="nav-burger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </label>
          <div className="nav-drawer-layer">
            <div className="nav-drawer" role="dialog" aria-label="Site menu">
              <div className="flex items-center justify-between border-b px-4 py-6">
                <Image
                  src="/Evuddy-logo-dark-E.png"
                  alt="EVUDDY"
                  width={180}
                  height={55}
                  className="h-11 w-auto"
                />
                <label
                  htmlFor="evuddy-nav-menu"
                  className="rounded-full p-2 transition hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={28} className="text-gray-800" />
                </label>
              </div>
              <div className="space-y-1 px-4 py-8">
                {navLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={closeMenu}
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
                      onClick={closeMenu}
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
                      onClick={closeMenu}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition hover:bg-[#18B368] hover:text-white"
                    >
                      <Building2 size={20} />
                      Become a dealer
                    </Link>
                    <Link
                      href="/partners"
                      onClick={closeMenu}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#18B368]/20 bg-white font-semibold text-[#18B368] transition hover:bg-[#18B368] hover:text-white"
                    >
                      <Building2 size={20} />
                      Fleet Partner
                    </Link>
                    <Link
                      href="/partners#fleet-investment"
                      onClick={closeMenu}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1F6B4A] font-semibold text-white transition hover:bg-[#18573c]"
                    >
                      <Wallet size={20} />
                      Invest
                    </Link>
                    <Link
                      href="/ride-options"
                      onClick={closeMenu}
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
        </div>
      </div>
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
