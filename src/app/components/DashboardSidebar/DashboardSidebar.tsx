"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  LayoutDashboard,
  Bike,
  Car,
  MapPinned,
  Building2,
  BatteryCharging,
  Zap,
  Radio,
  IndianRupee,
  Users,
  UserCheck,
  Headphones,
  CalendarDays,
  CreditCard,
  BarChart3,
  RefreshCcw,
  Wallet,
  MapPin,
  KeyRound,
  Shield,
} from "lucide-react";

type Props = {
  activeDashboard: string;
  setActiveDashboard: (dashboard: string) => void;
  allowedDashboards?: string[] | null;
  canManageTeam?: boolean;
  sessionUsername?: string;
  sessionRole?: "super" | "staff";
};

const menus = [
  { id: "admin", name: "Admin Dashboard", icon: LayoutDashboard },
  { id: "fleet", name: "Fleet Dashboard", icon: Bike },
  { id: "vehicles", name: "Vehicle Management", icon: Car },
  { id: "hub", name: "Hub Dashboard", icon: MapPinned },
  { id: "hubmanagement", name: "Hub Management", icon: Building2 },
  { id: "citymanagement", name: "City Management", icon: MapPin },
  { id: "battery", name: "Battery Dashboard", icon: BatteryCharging },
  { id: "swap", name: "Battery Swap", icon: Zap },
  { id: "iot", name: "IoT Dashboard", icon: Radio },
  { id: "wallet", name: "Wallet Dashboard", icon: Wallet },
  { id: "revenue", name: "Revenue Dashboard", icon: IndianRupee },
  { id: "partner", name: "Partner Dashboard", icon: Users },
  { id: "users", name: "User Management", icon: Users },
  { id: "kyc", name: "KYC Dashboard", icon: UserCheck },
  { id: "support", name: "Support Dashboard", icon: Headphones },
  { id: "bookings", name: "Booking Management", icon: CalendarDays },
  { id: "renttoown", name: "Rent to Own", icon: KeyRound },
  { id: "transactions", name: "Transactions", icon: CreditCard },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "refunds", name: "Refund Dashboard", icon: RefreshCcw },
  { id: "audit", name: "Audit Logs", icon: BarChart3 },
  { id: "team", name: "Team Access", icon: Shield },
];

export default function DashboardSidebar({
  activeDashboard,
  setActiveDashboard,
  allowedDashboards = null,
  canManageTeam = false,
  sessionUsername = "superadmin",
  sessionRole = "super",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleMenus = (
    allowedDashboards
      ? menus.filter((menu) =>
          menu.id === "team" ? canManageTeam : allowedDashboards.includes(menu.id)
        )
      : menus.filter((menu) => (menu.id === "team" ? canManageTeam : true))
  );
  const activeName = visibleMenus.find((menu) => menu.id === activeDashboard)?.name || "Operations";

  return (
    <>
      <header className="no-print fixed inset-x-0 top-0 z-[55] flex h-14 items-center gap-3 border-b border-[#18B368]/20 bg-white/90 px-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#18B368]/25 bg-white text-[#0A1134] transition hover:border-[#18B368] hover:bg-[#18B368] hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-slate-800" />
        </button>
        <Image src="/evuddy.jpeg" alt="EVUDDY" width={32} height={32} className="rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-tight text-slate-900">{activeName}</p>
          <p className="text-[11px] text-slate-500">EVUDDY operations</p>
        </div>
      </header>

      {mobileOpen ? (
        <div
          onClick={() => setMobileOpen(false)}
          className="no-print fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] flex-col border-r border-white/10 bg-[#0b1220] text-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src="/evuddy.jpeg"
            alt="EVUDDY"
            width={40}
            height={40}
            priority
            className="rounded-xl ring-2 ring-[#18B368]/50"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-medium tracking-[-0.02em]">EVUDDY</h2>
            <p className="text-[11px] font-normal tracking-[0.04em] text-[#18B368]">Smart Electric Mobility</p>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-[#18B368]/70">
          Enterprise Operations Center
        </p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {visibleMenus.map((menu) => {
            const Icon = menu.icon;
            const active = activeDashboard === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => {
                  setActiveDashboard(menu.id);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] tracking-tight transition duration-200 ${
                  active
                    ? "bg-[#18B368] text-white shadow-[0_8px_18px_rgba(24,179,104,0.35)]"
                    : "text-white/75 hover:bg-[#18B368]/15 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate font-medium">{menu.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="overflow-hidden rounded-2xl border border-[#18B368]/30 bg-[#18B368]/10">
            <div className="h-0.5 w-full bg-[#18B368]" />
            <div className="px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#18B368]">
                Logged in as
              </p>
              <p className="mt-1 truncate text-sm font-medium tracking-tight">
                {sessionRole === "staff" ? sessionUsername || "Staff" : "EVUDDY Administrator"}
              </p>
              <p className="mt-1 text-[11px] text-white/50">
                {sessionRole === "staff" ? "Staff access" : "Super admin · Operations Center"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
