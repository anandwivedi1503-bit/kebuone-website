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
import WalletDashboard from "../WalletDashboard/WalletDashboard";
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
    <div className="min-h-screen bg-[#F4F7FB]">
      <DashboardSidebar
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
      />

      <main className="min-h-screen lg:ml-[300px]">
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
          {activeDashboard === "admin" && (
            <AdminDashboard setActiveDashboard={setActiveDashboard} />
          )}
          {activeDashboard === "fleet" && <FleetDashboard />}
          {activeDashboard === "hub" && <HubDashboard />}
          {activeDashboard === "hubmanagement" && <HubManagement />}
          {activeDashboard === "battery" && <BatteryDashboard />}
          {activeDashboard === "swap" && <BatterySwapDashboard />}
          {activeDashboard === "iot" && <IoTDashboard />}
          {activeDashboard === "wallet" && <WalletDashboard />}
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