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
      <header className="no-print fixed inset-x-0 top-0 z-[55] flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-slate-800" />
        </button>
        <Image src="/evuddy.jpeg" alt="EVUDDY" width={32} height={32} className="rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{activeName}</p>
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
            className="rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight">EVUDDY</h2>
            <p className="text-[11px] text-white/55">Smart Electric Mobility</p>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
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
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate font-medium">{menu.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] text-white/50">Logged in as</p>
            <p className="text-sm font-semibold">EVUDDY Administrator</p>
            <p className="mt-2 text-[11px] text-white/45">Operations Center · Version 2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
