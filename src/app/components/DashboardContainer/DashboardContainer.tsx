"use client";

import { useState } from "react";

import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";

import AdminDashboard from "../AdminDashboard/AdminDashboard";
import FleetDashboard from "../FleetDashboard/FleetDashboard";
import HubDashboard from "../HubDashboard/HubDashboard";
import BatteryDashboard from "../BatteryDashboard/BatteryDashboard";
import BatterySwapDashboard from "../BatterySwapDashboard/BatterySwapDashboard";
import IoTDashboard from "../IoTDashboard/IoTDashboard";
import RevenueDashboard from "../RevenueDashboard/RevenueDashboard";
import PartnerDashboard from "../PartnerDashboard/PartnerDashboard";
import SupportDashboard from "../SupportDashboard/SupportDashboard";
import KYCDashboard from "../KYCDashboard/KYCDashboard";
import UserManagement from "../UserManagement/UserManagement";
import VehicleManagement from "../VehicleManagement/VehicleManagement";
import HubManagement from "../HubManagement/HubManagement";
import BookingDashboard from "../BookingDashboard/BookingDashboard";
import TransactionDashboard from "../TransactionDashboard/TransactionDashboard";
import AnalyticsDashboard from "../AnalyticsDashboard/AnalyticsDashboard";
import RefundDashboard from "../RefundDashboard/RefundDashboard";

export default function DashboardContainer() {
  const [activeDashboard, setActiveDashboard] = useState("admin");

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <DashboardSidebar
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
      />

      <main className="min-h-screen lg:ml-[300px]">
        <div className="px-3 py-5 sm:p-5 lg:p-8 xl:p-10">
          {activeDashboard === "admin" && (
            <AdminDashboard setActiveDashboard={setActiveDashboard} />
          )}
          {activeDashboard === "fleet" && <FleetDashboard />}
          {activeDashboard === "hub" && <HubDashboard />}
          {activeDashboard === "hubmanagement" && <HubManagement />}
          {activeDashboard === "battery" && <BatteryDashboard />}
          {activeDashboard === "swap" && <BatterySwapDashboard />}
          {activeDashboard === "iot" && <IoTDashboard />}
          {activeDashboard === "revenue" && <RevenueDashboard />}
          {activeDashboard === "partner" && <PartnerDashboard />}
          {activeDashboard === "support" && <SupportDashboard />}
          {activeDashboard === "users" && <UserManagement />}
          {activeDashboard === "vehicles" && <VehicleManagement />}
          {activeDashboard === "kyc" && <KYCDashboard />}
          {activeDashboard === "bookings" && <BookingDashboard />}
          {activeDashboard === "transactions" && <TransactionDashboard />}
          {activeDashboard === "analytics" && <AnalyticsDashboard />}
          {activeDashboard === "refunds" && <RefundDashboard />}
        </div>
      </main>
    </div>
  );
}