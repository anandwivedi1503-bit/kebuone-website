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
} from "lucide-react";

type Props = {
  activeDashboard: string;
  setActiveDashboard: (dashboard: string) => void;
};

const menus = [
  {
    id: "admin",
    name: "Admin Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "fleet",
    name: "Fleet Dashboard",
    icon: Bike,
  },
  {
    id: "vehicles",
    name: "Vehicle Management",
    icon: Car,
  },
  {
    id: "hub",
    name: "Hub Dashboard",
    icon: MapPinned,
  },
  {
  id: "hubmanagement",
  name: "Hub Management",
  icon: Building2,
},
{
  id: "citymanagement",
  name: "City Management",
  icon: MapPin,
},
{
  id: "battery",
  name: "Battery Dashboard",
  icon: BatteryCharging,
},
  {
    id: "swap",
    name: "Battery Swap",
    icon: Zap,
  },
  {
    id: "iot",
    name: "IoT Dashboard",
    icon: Radio,
  },

  {
  id: "wallet",
  name: "Wallet Dashboard",
  icon: Wallet,
},
  {
    id: "revenue",
    name: "Revenue Dashboard",
    icon: IndianRupee,
  },
  {
    id: "partner",
    name: "Partner Dashboard",
    icon: Users,
  },
  {
    id: "users",
    name: "User Management",
    icon: Users,
  },
  {
    id: "kyc",
    name: "KYC Dashboard",
    icon: UserCheck,
  },
  {
    id: "support",
    name: "Support Dashboard",
    icon: Headphones,
  },
  {
    id: "bookings",
    name: "Booking Management",
    icon: CalendarDays,
  },
  {
    id: "renttoown",
    name: "Rent to Own",
    icon: KeyRound,
  },
  {
    id: "transactions",
    name: "Transactions",
    icon: CreditCard,
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
  },
  {
    id: "refunds",
    name: "Refund Dashboard",
    icon: RefreshCcw,
  },

];
export default function DashboardSidebar({
  activeDashboard,
  setActiveDashboard,
}: Props) {

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>

      {/* Mobile Menu Button */}

      <button
        onClick={() => setMobileOpen(true)}
        className="
        lg:hidden
        fixed
        top-5
        left-5
        z-[60]
        w-12
        h-12
        rounded-2xl
        bg-white
        shadow-xl
        flex
        items-center
        justify-center
        "
      >
        <Menu size={24} className="text-[#FF165E]" />
      </button>

      {/* Mobile Overlay */}

      {mobileOpen && (

        <div
          onClick={() => setMobileOpen(false)}
          className="
          lg:hidden
          fixed
          inset-0
          bg-black/50
          backdrop-blur-sm
          z-40
          "
        />

      )}

      {/* Sidebar */}

      <aside
        className={`
        fixed
        top-0
        left-0
        h-screen
        w-[300px]
        bg-gradient-to-b
        from-[#07111F]
via-[#0E1728]
to-[#15253D]
        text-white
        shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        flex
        flex-col
        z-50
        transition-transform
        duration-300

        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

        lg:translate-x-0
        `}
      >

        {/* Logo */}

        <div className="px-7 py-8 border-b border-white/15">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

  <Image
    src="/evuddy.jpeg"
    alt="EVUDDY"
    width={64}
    height={64}
    priority
    className="
      rounded-2xl
      shadow-xl
      border
      border-white/20
    "
  />

  <div>

    <h2 className="text-3xl font-black tracking-wide leading-none">
      EVUDDY
    </h2>

    <p className="text-sm text-white/75">
      Smart Electric Mobility
    </p>

  </div>

</div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden"
            >
              <X size={28} />
            </button>

          </div>

          <p className="mt-5 leading-7 text-sm text-white/75">

Enterprise Operations Center

</p>

        </div>

        {/* Menu */}

        <div
          className="
          flex-1
          overflow-y-auto
          px-4
          py-6
          space-y-3
          "
        >
        {menus.map((menu) => {

  const Icon = menu.icon;

  return (

    <button
      key={menu.id}
      onClick={() => {
        setActiveDashboard(menu.id);
        setMobileOpen(false);
      }}
      className={`
      group
      relative
      w-full
      flex
      items-center
      gap-4
      px-5
      py-4
      rounded-2xl
      transition-all
      duration-300
      text-left
      overflow-hidden

      ${
  activeDashboard === menu.id
    ? "bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#07111F] shadow-2xl scale-[1.02]"
    : "text-white hover:bg-white/10 hover:translate-x-1"
}
      `}
    >

      {/* Active Left Indicator */}

      {activeDashboard === menu.id && (

        <div
          className="
          absolute
          left-0
          top-0
          h-full
          w-1.5
          bg-[#EEB440]
          rounded-r-full
          "
        />

      )}

      {/* Icon */}

      <div
        className={`
        w-11
        h-11
        rounded-xl
        flex
        items-center
        justify-center
        transition-all

        ${
          activeDashboard === menu.id
            ? "bg-white/70"
            : "bg-white/10 group-hover:bg-white/20"
        }
        `}
      >

        <Icon size={21} />

      </div>

      {/* Text */}

      <div className="flex-1">

        <h4 className="font-semibold text-[15px]">
          {menu.name}
        </h4>

      </div>

      {/* Arrow */}

      <div
        className={`
        transition-all
        duration-300

        ${
          activeDashboard === menu.id
            ? "opacity-100 translate-x-0"
            : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
        }
        `}
      >
        →
      </div>

    </button>

  );

})}

</div>

        {/* Footer */}

        <div className="border-t border-white/15 p-5">

          <div
            className="
            rounded-3xl
            bg-white/10
            backdrop-blur-xl
            border
            border-white/10
            p-5
            shadow-xl
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                relative
                w-12
                h-12
                rounded-full
                bg-gradient-to-r
                from-[#EEB440]
                to-white
                flex
                items-center
                justify-center
                text-[#FF165E]
                font-black
                text-lg
                "
              >
                A

                <span
                  className="
                  absolute
                  bottom-0
                  right-0
                  w-3.5
                  h-3.5
                  rounded-full
                  bg-green-400
                  border-2
                  border-white
                  "
                />

              </div>

              <div>

                <p className="text-xs text-white/60 mb-1">
Logged in as
</p>

<h3 className="text-sm font-bold">
EVUDDY Administrator
</h3>

              </div>

            </div>

            <div className="mt-5 flex items-center justify-between">

              <span
                className="
                rounded-full
                bg-white/15
                px-3
                py-1
                text-xs
                "
              >
               Operations Center
              </span>

              <span className="text-xs text-white/70">
                Version 2.0
              </span>

            </div>

          </div>

        </div>

      </aside>

    </>
  );
}