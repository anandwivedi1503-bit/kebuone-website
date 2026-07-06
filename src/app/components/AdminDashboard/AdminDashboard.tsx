"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BatteryCharging,
  Bell,
  Bike,
  BookOpen,
  Building2,
  BadgeCheck,
  ChevronDown,
  CircleDollarSign,
  Cpu,
  CreditCard,
  Gauge,
  Handshake,
  Headphones,
  IndianRupee,
  LifeBuoy,
  MapPin,
  Moon,
  Radio,
  RefreshCw,
  Route,
  Search,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";

type NotificationItem = { id: number; title: string; time: string };
type ActivityItem = { icon: LucideIcon; title: string; subtitle: string; time: string; tone: string };
type Tone = { icon: string; value: string; note: string; border: string };

const rupee = (value: number) => `\u20B9${value.toLocaleString("en-IN")}`;

const formatActivityTime = (value: any) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const loadList = (url: string, setter: Dispatch<SetStateAction<any[]>>) => {
  fetch(url)
    .then((res) => res.json())
    .then((data) => setter(data.data || []));
};

type AdminDashboardProps = {
  setActiveDashboard?: (dashboard: string) => void;
};

export default function AdminDashboard({
  setActiveDashboard,
}: AdminDashboardProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");


  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [riders, setRiders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [iotData, setIotData] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);

  const [notifications] = useState<NotificationItem[]>([
    { id: 1, title: "Battery swap completed", time: "2 min ago" },
    { id: 2, title: "New rider registered", time: "5 min ago" },
    { id: 3, title: "Refund request received", time: "12 min ago" },
    { id: 4, title: "Vehicle went offline", time: "22 min ago" },
  ]);

   const [greeting, setGreeting] = useState("Welcome");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const hour = today.getHours();

    setGreeting(
      hour < 12
        ? "Good Morning"
        : hour < 18
        ? "Good Afternoon"
        : "Good Evening"
    );

    setFormattedDate(
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(today)
    );
  }, []);

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notification-menu") && !target.closest(".profile-menu")) {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    loadList("/api/riders", setRiders);
    loadList("/api/vehicles", setVehicles);
    loadList("/api/hubs", setHubs);
    loadList("/api/bookings", setBookings);
    loadList("/api/tickets", setTickets);
    loadList("/api/transactions", setTransactions);
    loadList("/api/iot", setIotData);
    loadList("/api/refunds", setRefunds);
  }, []);

  const totalRevenue = transactions.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

  const activeRides = bookings.filter(
    (item: any) => item.rideStatus === "Booked" || item.rideStatus === "In Ride"
  ).length;

  const getGpsStatus = (status: unknown) =>
  String(status || "").trim().toUpperCase();

const onlineVehicles = iotData.filter(
  (item: any) => getGpsStatus(item.gpsStatus) === "ONLINE"
).length;

const offlineVehicles = iotData.filter(
  (item: any) => getGpsStatus(item.gpsStatus) === "OFFLINE"
).length;
  const openTickets = tickets.filter((item: any) => item.status === "OPEN").length;
  const processingRefunds = refunds.filter((item: any) => item.refundStatus === "PROCESSING").length;
  const activeHubs = hubs.filter((item: any) => item.status === "Active").length;
  const lowBatteryVehicles = iotData.filter((item: any) => item.batteryPercentage <= 20).length;
  const geofenceAlerts = iotData.filter((item: any) => item.alertType).length;


  const criticalAlerts = lowBatteryVehicles + geofenceAlerts + offlineVehicles + processingRefunds;

  const recentActivities: ActivityItem[] = [
  ...bookings.slice(0, 3).map((booking: any) => ({
    icon: Bike,
    title: `${booking.userName || booking.userPhone || "Rider"} booked ${booking.vehicleId || "Vehicle"}`,
    subtitle: booking.bookingId || "Booking",
    time: formatActivityTime(booking.createdAt),
    tone: "bg-sky-50 text-sky-600",
  })),

  ...transactions.slice(0, 3).map((txn: any) => ({
    icon: IndianRupee,
    title: `Payment Received ₹${txn.amount || 0}`,
    subtitle: txn.transactionId || "Transaction",
    time: formatActivityTime(txn.createdAt),
    tone: "bg-emerald-50 text-emerald-600",
  })),

  ...tickets.slice(0, 3).map((ticket: any) => ({
    icon: Headphones,
    title: `Support Ticket ${ticket.ticketId || ""}`,
    subtitle: ticket.category || "Support",
    time: formatActivityTime(ticket.createdAt),
    tone: "bg-amber-50 text-amber-600",
  })),

  ...refunds.slice(0, 3).map((refund: any) => ({
    icon: CreditCard,
    title: `Refund ₹${refund.amount || 0}`,
    subtitle: refund.refundStatus || "Processing",
    time: formatActivityTime(refund.createdAt),
    tone: "bg-rose-50 text-rose-600",
  })),
]
  .sort(() => Math.random() - 0.5)
  .slice(0, 8);

  const pageClass = darkMode
    ? "min-h-screen bg-[#080b12] text-slate-100"
    : "min-h-screen bg-[#f5f7fb] text-slate-950";

  const panelClass = darkMode
    ? "border border-white/10 bg-[#101722] shadow-lg shadow-black/20"
    : "border border-slate-200 bg-white shadow-sm shadow-slate-200/80";

  const softPanelClass = darkMode
    ? "border border-white/10 bg-white/[0.03]"
    : "border border-slate-200 bg-slate-50/80";

  const headingClass = darkMode ? "text-white" : "text-[#0A1134]";
  const mutedClass = darkMode ? "text-slate-400" : "text-slate-500";
  const dividerClass = darkMode ? "divide-white/10" : "divide-slate-100";
  const borderClass = darkMode ? "border-white/10" : "border-slate-200";

  const inputClass = darkMode
    ? "border-white/10 bg-[#0b111a] text-white placeholder:text-slate-500 focus:border-rose-400 focus:ring-rose-400/20"
    : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-rose-400 focus:ring-rose-400/20";

  const iconButtonClass = darkMode
    ? "border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  const menuClass = darkMode
    ? "border border-white/10 bg-[#101722] text-slate-100 shadow-2xl shadow-black/40"
    : "border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-300/40";

  const kpiCards: {
    title: string;
    value: string | number;
    note: string;
    icon: LucideIcon;
    tone: Tone;
  }[] = [
    {
      title: "Total Riders",
      value: riders.length,
      note: "Live Database",
      icon: Users,
      tone: {
        icon: "bg-rose-50 text-rose-600",
        value: headingClass,
        note: "text-emerald-600",
        border: "hover:border-rose-200",
      },
    },
    {
      title: "Fleet Vehicles",
      value: vehicles.length,
      note: `${onlineVehicles} Online`,
      icon: Bike,
      tone: {
        icon: "bg-emerald-50 text-emerald-600",
        value: "text-emerald-600",
        note: "text-emerald-600",
        border: "hover:border-emerald-200",
      },
    },
    {
      title: "Active Rides",
      value: activeRides,
      note: "Live Tracking",
      icon: Route,
      tone: {
        icon: "bg-sky-50 text-sky-600",
        value: "text-sky-600",
        note: "text-sky-600",
        border: "hover:border-sky-200",
      },
    },
    {
      title: "Operational Hubs",
      value: activeHubs,
      note: "Running Normally",
      icon: Building2,
      tone: {
        icon: "bg-amber-50 text-amber-600",
        value: "text-amber-600",
        note: "text-amber-600",
        border: "hover:border-amber-200",
      },
    },
    {
      title: "Today's Revenue",
      value: rupee(totalRevenue),
      note: "Live Collection",
      icon: IndianRupee,
      tone: {
        icon: "bg-pink-50 text-pink-600",
        value: "text-pink-600",
        note: "text-pink-600",
        border: "hover:border-pink-200",
      },
    },
    {
      title: "Open Tickets",
      value: openTickets,
      note: `${processingRefunds} Refund Pending`,
      icon: LifeBuoy,
      tone: {
        icon: "bg-red-50 text-red-600",
        value: "text-red-600",
        note: "text-red-600",
        border: "hover:border-red-200",
      },
    },
  ];

  const operationCards = [
    {
      title: "Fleet Management",
      badge: `${vehicles.length} Fleet`,
      icon: Bike,
      tone: "bg-emerald-50 text-emerald-600",
      badgeClass: "text-emerald-600",
      lines: [`Online Vehicles : ${onlineVehicles}`, `Available Vehicles : ${vehicles.length}`],
    },
    {
      title: "Hub Network",
      badge: activeHubs,
      icon: MapPin,
      tone: "bg-sky-50 text-sky-600",
      badgeClass: "text-sky-600",
      lines: ["Operational Hubs", `Total Hubs : ${hubs.length}`],
    },
    {
      title: "Battery Network",
      badge: "Healthy",
      icon: BatteryCharging,
      tone: "bg-amber-50 text-amber-600",
      badgeClass: "text-amber-600",
      lines: ["Battery Swapping System Active", "Charging Stations Online"],
    },
    {
      title: "IoT Monitoring",
      badge: onlineVehicles,
      icon: Radio,
      tone: "bg-violet-50 text-violet-600",
      badgeClass: "text-violet-600",
      lines: ["GPS Devices Connected", "Vehicle Tracking Active"],
    },
    {
      title: "Revenue Engine",
      badge: rupee(totalRevenue),
      icon: CircleDollarSign,
      tone: "bg-pink-50 text-pink-600",
      badgeClass: "text-pink-600",
      lines: ["Today's Collection", "Live Transactions"],
    },
    {
      title: "Support Center",
      badge: openTickets,
      icon: Headphones,
      tone: "bg-red-50 text-red-600",
      badgeClass: "text-red-600",
      lines: ["Open Support Tickets", "Customer Support Running"],
    },
  ];

  const alertCards = [
    {
      title: "Low Battery",
      status: "CRITICAL",
      value: lowBatteryVehicles,
      description: "Vehicles below 20% battery.",
      icon: BatteryCharging,
      tone: "bg-red-50 text-red-600",
      statusClass: "text-red-600",
      border: "border-l-red-500",
    },
    {
      title: "Geofence Alerts",
      status: "WARNING",
      value: geofenceAlerts,
      description: "Vehicles outside service zones.",
      icon: MapPin,
      tone: "bg-orange-50 text-orange-600",
      statusClass: "text-orange-600",
      border: "border-l-orange-500",
    },
    {
      title: "Offline Vehicles",
      status: "OFFLINE",
      value: offlineVehicles,
      description: "GPS disconnected vehicles.",
      icon: WifiOff,
      tone: "bg-yellow-50 text-yellow-700",
      statusClass: "text-yellow-700",
      border: "border-l-yellow-500",
    },
    {
      title: "Refund Requests",
      status: "PENDING",
      value: processingRefunds,
      description: "Waiting for approval.",
      icon: Wallet,
      tone: "bg-sky-50 text-sky-600",
      statusClass: "text-sky-600",
      border: "border-l-sky-500",
    },
  ];

  const quickActions = [
  { title: "Users", description: "Manage Riders", dashboard: "users", icon: UserRound, tone: "bg-rose-50 text-rose-600" },
  { title: "Fleet", description: "Vehicle Management", dashboard: "fleet", icon: Bike, tone: "bg-emerald-50 text-emerald-600" },
  { title: "Hubs", description: "Hub Operations", dashboard: "hub", icon: MapPin, tone: "bg-sky-50 text-sky-600" },
  { title: "Batteries", description: "Battery Network", dashboard: "battery", icon: BatteryCharging, tone: "bg-amber-50 text-amber-600" },
  { title: "Revenue", description: "Finance Dashboard", dashboard: "revenue", icon: IndianRupee, tone: "bg-pink-50 text-pink-600" },
  { title: "Analytics", description: "Business Reports", dashboard: "analytics", icon: BarChart3, tone: "bg-violet-50 text-violet-600" },
  { title: "Support", description: "Tickets & Refunds", dashboard: "support", icon: Headphones, tone: "bg-red-50 text-red-600" },
  { title: "IoT", description: "Live Tracking", dashboard: "iot", icon: Cpu, tone: "bg-cyan-50 text-cyan-600" },
  { title: "Bookings", description: "Ride Management", dashboard: "bookings", icon: BookOpen, tone: "bg-orange-50 text-orange-600" },
  { title: "Partners", description: "Franchise Requests", dashboard: "partner", icon: Handshake, tone: "bg-indigo-50 text-indigo-600" },
  { title: "KYC", description: "Verification Center", dashboard: "kyc", icon: BadgeCheck, tone: "bg-teal-50 text-teal-600" },
  { title: "Settings", description: "System Configuration", dashboard: "admin", icon: Settings, tone: "bg-[#0A1134] text-white", featured: true },
];

  return (
    <section className={`${pageClass} overflow-x-hidden transition-colors duration-300`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className={`${panelClass} rounded-lg p-4 sm:p-5 lg:p-6`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
                  <Sparkles size={14} />
                  {greeting}
                </span>
                <span className={`${softPanelClass} rounded-full px-3 py-1.5 text-xs font-semibold ${mutedClass}`}>
                  {formattedDate}
                </span>
              </div>

              <h1 className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${headingClass}`}>
                Admin Dashboard
              </h1>

              <p className={`mt-3 max-w-3xl text-sm leading-6 sm:text-base ${mutedClass}`}>
                Monitor your riders, hubs, fleet, IoT devices, battery network and complete Kebu One business from one intelligent dashboard.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto">
              <div className="relative min-w-0 xl:w-[360px]">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search anything..."
                  className={`h-12 w-full rounded-md border pl-11 pr-4 text-sm font-medium outline-none transition focus:ring-4 ${inputClass}`}
                />
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="relative notification-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationOpen(!notificationOpen);
                    }}
                    title="Notifications"
                    className={`relative flex h-11 w-11 items-center justify-center rounded-md border transition ${iconButtonClass}`}
                  >
                    <Bell size={19} />
                    <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>

                  {notificationOpen && (
                    <div className={`absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] overflow-hidden rounded-lg sm:w-80 ${menuClass}`}>
                      <div className={`border-b px-5 py-4 ${borderClass}`}>
                        <h3 className={`font-bold ${headingClass}`}>Notifications</h3>
                      </div>

                      <div className={`divide-y ${dividerClass}`}>
                        {notifications.map((item) => (
                          <button key={item.id} className="w-full px-5 py-4 text-left transition hover:bg-rose-50/70">
                            <p className={`text-sm font-semibold ${headingClass}`}>{item.title}</p>
                            <p className={`mt-1 text-xs ${mutedClass}`}>{item.time}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  title="Toggle theme"
                  className={`flex h-11 w-11 items-center justify-center rounded-md border transition ${iconButtonClass}`}
                >
                  {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                <div className="relative profile-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen(!profileOpen);
                    }}
                    className={`flex h-11 items-center gap-3 rounded-md border px-2.5 transition sm:h-12 sm:px-3 ${iconButtonClass}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#D6006E] to-[#FF5556] text-sm font-black text-white">
                      A
                    </div>

                    <div className="hidden text-left md:block">
                      <h4 className={`text-sm font-bold leading-4 ${headingClass}`}>Administrator</h4>
                      <p className={`mt-0.5 text-xs ${mutedClass}`}>Super Admin</p>
                    </div>

                    <ChevronDown size={17} className={mutedClass} />
                  </button>

                  {profileOpen && (
                    <div className={`absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-lg ${menuClass}`}>
                      <button className="w-full px-4 py-3 text-left text-sm font-semibold transition hover:bg-rose-50/70">Profile</button>
                      <button className="w-full px-4 py-3 text-left text-sm font-semibold transition hover:bg-rose-50/70">Settings</button>
                      <a
  href="/api/admin-logout"
  className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
>
  Logout
</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className={`${panelClass} rounded-lg p-4 sm:p-5`}>
            <p className={`text-sm font-semibold ${mutedClass}`}>Today</p>
            <h2 className={`mt-1 text-xl font-black sm:text-2xl ${headingClass}`}>{formattedDate}</h2>
          </div>

          <div className={`${panelClass} flex items-center gap-3 rounded-lg p-4 sm:p-5`}>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-600">All Systems Operational</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Live Operations", "Real-Time Tracking", "AI Monitoring", "Control Center"].map((item) => (
            <span key={item} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
              {item}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className={`${panelClass} ${card.tone.border} rounded-lg p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl`}>
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-md ${card.tone.icon}`}>
                    <Icon size={21} />
                  </div>
                  <Gauge size={18} className={mutedClass} />
                </div>

                <p className={`mt-5 text-sm font-semibold ${mutedClass}`}>{card.title}</p>
                <h2 className={`mt-2 break-words text-3xl font-black tracking-tight ${card.tone.value}`}>{card.value}</h2>
                <p className={`mt-3 text-sm font-bold ${card.tone.note}`}>{card.note}</p>
              </div>
            );
          })}
        </div>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${headingClass}`}>Operations Monitoring</h2>
              <p className={`mt-2 text-sm sm:text-base ${mutedClass}`}>Real-time operational health across the Kebu One ecosystem.</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              System Healthy
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operationCards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.title} className={`${panelClass} rounded-lg p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-md ${card.tone}`}>
                      <Icon size={23} />
                    </div>
                    <span className={`text-sm font-black ${card.badgeClass}`}>{card.badge}</span>
                  </div>

                  <h3 className={`mt-6 text-xl font-black ${headingClass}`}>{card.title}</h3>
                  <div className="mt-3 space-y-1">
                    {card.lines.map((line) => (
                      <p key={line} className={`text-sm ${mutedClass}`}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${headingClass}`}>System Alerts</h2>
              <p className={`mt-2 text-sm sm:text-base ${mutedClass}`}>Live alerts generated automatically from your MongoDB database.</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
              <AlertTriangle size={16} />
              {criticalAlerts} Active Alerts
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {alertCards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.title} className={`${panelClass} ${card.border} rounded-lg border-l-4 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-md ${card.tone}`}>
                      <Icon size={23} />
                    </div>
                    <span className={`text-xs font-black tracking-[0.12em] ${card.statusClass}`}>{card.status}</span>
                  </div>

                  <h3 className={`mt-6 text-lg font-black ${headingClass}`}>{card.title}</h3>
                  <h1 className={`mt-3 text-4xl font-black ${card.statusClass}`}>{card.value}</h1>
                  <p className={`mt-3 text-sm ${mutedClass}`}>{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${headingClass}`}>Recent Activity</h2>
              <p className={`mt-2 text-sm sm:text-base ${mutedClass}`}>Automatically updated from your live database.</p>
            </div>

            <button className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-gradient-to-r from-[#D6006E] to-[#FF5556] px-4 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5">
              <RefreshCw size={16} />
              Refresh Feed
            </button>
          </div>

          <div className={`${panelClass} overflow-hidden rounded-lg`}>
            <div className={`border-b px-4 py-4 sm:px-5 ${borderClass}`}>
              <h3 className={`text-lg font-black ${headingClass}`}>Live Activity Feed</h3>
              <p className={`mt-1 text-sm ${mutedClass}`}>Real-time updates across all Kebu One modules.</p>
            </div>

            <div className={`divide-y ${dividerClass}`}>
              {recentActivities.length === 0 && (
                <div className={`py-14 text-center text-sm font-medium ${mutedClass}`}>No Recent Activities</div>
              )}

              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;

                return (
                  <div key={index} className="flex items-start gap-3 px-4 py-4 transition hover:bg-rose-50/60 sm:gap-4 sm:px-5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${activity.tone}`}>
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`break-words text-sm font-bold sm:text-base ${headingClass}`}>{activity.title}</h4>
                      <p className={`mt-1 break-words text-sm ${mutedClass}`}>{activity.subtitle}</p>
                    </div>

                    <span className={`shrink-0 text-xs font-semibold ${mutedClass}`}>{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${headingClass}`}>Quick Actions</h2>
            <p className={`mt-2 text-sm sm:text-base ${mutedClass}`}>Access every management module instantly.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => {
  setActiveDashboard?.(action.dashboard);
}}
                  className={`${panelClass} group rounded-lg p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md transition group-hover:scale-105 ${action.tone}`}>
                    <Icon size={23} />
                  </div>

                  <h3 className={`mt-5 text-lg font-black ${action.featured ? "text-[#FF5556]" : headingClass}`}>
                    {action.title}
                  </h3>
                  <p className={`mt-2 text-sm ${mutedClass}`}>{action.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}