"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";
import "../DashboardUI/ops-shell.css";
import { ALL_DASHBOARDS } from "@/lib/adminRoles";

const deskFallback = (
  <p className="rounded-3xl bg-white p-8 text-slate-600">Loading desk…</p>
);

const AdminDashboard = dynamic(() => import("../AdminDashboard/AdminDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const FleetDashboard = dynamic(() => import("../FleetDashboard/FleetDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const HubDashboard = dynamic(() => import("../HubDashboard/HubDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const BatteryDashboard = dynamic(() => import("../BatteryDashboard/BatteryDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const BatterySwapDashboard = dynamic(
  () => import("../BatterySwapDashboard/BatterySwapDashboard"),
  { ssr: false, loading: () => deskFallback }
);
const IoTDashboard = dynamic(() => import("../IoTDashboard/IoTDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const RevenueDashboard = dynamic(() => import("../RevenueDashboard/RevenueDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const WalletDashboard = dynamic(() => import("../WalletDashboard/WalletDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const PartnerDashboard = dynamic(() => import("../PartnerDashboard/PartnerDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const SupportDashboard = dynamic(() => import("../SupportDashboard/SupportDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const KYCDashboard = dynamic(() => import("../KYCDashboard/KYCDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const UserManagement = dynamic(() => import("../UserManagement/UserManagement"), {
  ssr: false,
  loading: () => deskFallback,
});
const VehicleManagement = dynamic(() => import("../VehicleManagement/VehicleManagement"), {
  ssr: false,
  loading: () => deskFallback,
});
const HubManagement = dynamic(() => import("../HubManagement/HubManagement"), {
  ssr: false,
  loading: () => deskFallback,
});
const CityManagement = dynamic(() => import("../CityManagement/CityManagement"), {
  ssr: false,
  loading: () => deskFallback,
});
const BookingDashboard = dynamic(() => import("../BookingDashboard/BookingDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const TransactionDashboard = dynamic(
  () => import("../TransactionDashboard/TransactionDashboard"),
  { ssr: false, loading: () => deskFallback }
);
const AnalyticsDashboard = dynamic(
  () => import("../AnalyticsDashboard/AnalyticsDashboard"),
  { ssr: false, loading: () => deskFallback }
);
const RefundDashboard = dynamic(() => import("../RefundDashboard/RefundDashboard"), {
  ssr: false,
  loading: () => deskFallback,
});
const RentToOwnDashboard = dynamic(
  () => import("../RentToOwnDashboard/RentToOwnDashboard"),
  { ssr: false, loading: () => deskFallback }
);
const AuditLogsDashboard = dynamic(
  () => import("../AuditLogsDashboard/AuditLogsDashboard"),
  { ssr: false, loading: () => deskFallback }
);
const TeamAccess = dynamic(() => import("../TeamAccess/TeamAccess"), {
  ssr: false,
  loading: () => deskFallback,
});
const OpsAssistant = dynamic(() => import("../OpsAssistant/OpsAssistant"), {
  ssr: false,
});

type SessionInfo = {
  role: "super" | "staff";
  username: string;
  dashboards: string[];
};

export default function DashboardContainer() {
  const [activeDashboard, setActiveDashboard] = useState("admin");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setSession(data.data);
      setSessionReady(true);
    };
    void load();
  }, []);

  const isSuper = session?.role === "super";
  const allowed = isSuper ? [...ALL_DASHBOARDS] : session?.dashboards || [];
  const allowedKey = allowed.join(",");

  useEffect(() => {
    if (!session || isSuper) return;
    if (!allowed.includes(activeDashboard)) {
      setActiveDashboard(allowed[0] || "");
    }
  }, [session, activeDashboard, allowedKey, isSuper]);

  const show = (id: string) => isSuper || allowed.includes(id);

  return (
    <div className="ops-shell min-h-screen">
      <DashboardSidebar
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
        allowedDashboards={isSuper ? null : allowed}
        canManageTeam={isSuper}
        sessionUsername={session?.username}
        sessionRole={session?.role}
      />

      <main className="min-h-screen pt-14 lg:ml-[272px] lg:pt-0">
        <div className="px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-7">
          {!sessionReady ? (
            <p className="rounded-3xl bg-white p-8 text-slate-600">Loading ops access…</p>
          ) : (
            <>
          {activeDashboard === "admin" && show("admin") && (
            <AdminDashboard setActiveDashboard={setActiveDashboard} />
          )}
          {activeDashboard === "fleet" && show("fleet") && <FleetDashboard />}
          {activeDashboard === "hub" && show("hub") && <HubDashboard />}
          {activeDashboard === "hubmanagement" && show("hubmanagement") && (
            <HubManagement />
          )}
          {activeDashboard === "citymanagement" && show("citymanagement") && (
            <CityManagement />
          )}
          {activeDashboard === "battery" && show("battery") && <BatteryDashboard />}
          {activeDashboard === "swap" && show("swap") && <BatterySwapDashboard />}
          {activeDashboard === "iot" && show("iot") && <IoTDashboard />}
          {activeDashboard === "wallet" && show("wallet") && <WalletDashboard />}
          {activeDashboard === "revenue" && show("revenue") && <RevenueDashboard />}
          {activeDashboard === "partner" && show("partner") && <PartnerDashboard />}
          {activeDashboard === "support" && show("support") && <SupportDashboard />}
          {activeDashboard === "users" && show("users") && <UserManagement />}
          {activeDashboard === "vehicles" && show("vehicles") && (
            <VehicleManagement />
          )}
          {activeDashboard === "kyc" && show("kyc") && <KYCDashboard />}
          {activeDashboard === "bookings" && show("bookings") && <BookingDashboard />}
          {activeDashboard === "renttoown" && show("renttoown") && (
            <RentToOwnDashboard />
          )}
          {activeDashboard === "audit" && show("audit") && <AuditLogsDashboard />}
          {activeDashboard === "transactions" && show("transactions") && (
            <TransactionDashboard />
          )}
          {activeDashboard === "analytics" && show("analytics") && (
            <AnalyticsDashboard />
          )}
          {activeDashboard === "refunds" && show("refunds") && <RefundDashboard />}
          {activeDashboard === "team" && isSuper && <TeamAccess />}
          {!isSuper && allowed.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-slate-600">
              This login has no dashboards assigned. Ask super admin to grant access.
            </p>
          ) : null}
            </>
          )}
        </div>
      </main>
      <OpsAssistant onOpenDashboard={setActiveDashboard} />
    </div>
  );
}
