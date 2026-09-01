"use client";

import { useEffect, useState } from "react";

import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";
import "../DashboardUI/ops-shell.css";

import AdminDashboard from "../AdminDashboard/AdminDashboard";
import FleetDashboard from "../FleetDashboard/FleetDashboard";
import HubDashboard from "../HubDashboard/HubDashboard";
import BatteryDashboard from "../BatteryDashboard/BatteryDashboard";
import BatterySwapDashboard from "../BatterySwapDashboard/BatterySwapDashboard";
import IoTDashboard from "../IoTDashboard/IoTDashboard";
import RevenueDashboard from "../RevenueDashboard/RevenueDashboard";
import WalletDashboard from "../WalletDashboard/WalletDashboard";
import PartnerDashboard from "../PartnerDashboard/PartnerDashboard";
import SupportDashboard from "../SupportDashboard/SupportDashboard";
import KYCDashboard from "../KYCDashboard/KYCDashboard";
import UserManagement from "../UserManagement/UserManagement";
import VehicleManagement from "../VehicleManagement/VehicleManagement";
import HubManagement from "../HubManagement/HubManagement";
import CityManagement from "../CityManagement/CityManagement";
import BookingDashboard from "../BookingDashboard/BookingDashboard";
import TransactionDashboard from "../TransactionDashboard/TransactionDashboard";
import AnalyticsDashboard from "../AnalyticsDashboard/AnalyticsDashboard";
import RefundDashboard from "../RefundDashboard/RefundDashboard";
import RentToOwnDashboard from "../RentToOwnDashboard/RentToOwnDashboard";
import AuditLogsDashboard from "../AuditLogsDashboard/AuditLogsDashboard";
import TeamAccess from "../TeamAccess/TeamAccess";
import OpsAssistant from "../OpsAssistant/OpsAssistant";
import { ALL_DASHBOARDS } from "@/lib/adminRoles";

type SessionInfo = {
  role: "super" | "staff";
  username: string;
  dashboards: string[];
};

export default function DashboardContainer() {
  const [activeDashboard, setActiveDashboard] = useState("admin");
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setSession(data.data);
    };
    void load();
  }, []);

  const isSuper = !session || session.role === "super";
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
        </div>
      </main>
      <OpsAssistant onOpenDashboard={setActiveDashboard} />
    </div>
  );
}
