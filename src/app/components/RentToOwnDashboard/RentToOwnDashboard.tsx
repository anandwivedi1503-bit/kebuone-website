"use client";

import { useEffect, useMemo, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import StatusBadge from "../DashboardUI/StatusBadge";
import DashboardActions from "../DashboardUI/DashboardActions";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";

type BookingRow = {
  _id?: string;
  bookingId: string;
  userName?: string;
  userPhone?: string;
  riderId?: string;
  vehicleId?: string;
  rideStatus?: string;
  paymentStatus?: string;
  remainingRentToOwnDays?: number;
  rtoInstallmentsPaid?: number;
  ownershipTransferred?: boolean;
  pendingAmount?: number;
  receivedAmount?: number;
  rtoNextInstallmentAt?: string;
};

type ReceiptRow = {
  _id?: string;
  transactionId?: string;
  bookingId?: string;
  userName?: string;
  amount?: number;
  gstAmount?: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  remarks?: string;
  createdAt?: string;
  status?: string;
};

export default function RentToOwnDashboard() {
  const [contracts, setContracts] = useState<BookingRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rto/daily-ledger", { cache: "no-store" });
        const data = await res.json();
        setContracts(data.data?.contracts || []);
        setReceipts(data.data?.receipts || []);
      } finally {
        setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(interval);
  }, []);

  const todayKey = new Date().toDateString();
  const todayReceipts = useMemo(
    () =>
      receipts.filter(
        (row) => row.createdAt && new Date(row.createdAt).toDateString() === todayKey
      ),
    [receipts, todayKey]
  );
  const active = contracts.filter((item) =>
    ["Booked", "Payment Pending", "Ready For Pickup", "In Ride"].includes(
      item.rideStatus || ""
    )
  ).length;
  const transferred = contracts.filter((item) => item.ownershipTransferred).length;
  const collected = contracts.reduce((sum, item) => sum + Number(item.receivedAmount || 0), 0);
  const todayTotal = todayReceipts.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <PageContainer>
      <DashboardHeader
        title="Rent to Own"
        subtitle="₹280 + 5% GST every day. Each payment is a receipt for the rider and a line on this ledger."
      />
      <OpsMoneyStrip />

      <KPIGrid>
        <KPICard title="Contracts" value={String(contracts.length)} subtitle="All time" icon="🔑" color="green" />
        <KPICard title="Active" value={String(active)} subtitle="In progress" icon="🛵" color="blue" />
        <KPICard title="Today collected" value={`₹${todayTotal.toLocaleString("en-IN")}`} subtitle="Daily receipts" icon="🧾" color="yellow" />
        <KPICard title="Transferred" value={String(transferred)} subtitle="Owned by rider" icon="✅" color="green" />
      </KPIGrid>
      <p className="mb-6 text-sm text-slate-500">Lifetime received ₹{collected.toLocaleString("en-IN")}</p>

      <div className="mb-6">
        <DashboardActions
          filename="RentToOwnDailyReceipts.csv"
          rows={receipts.map((item) => ({
            Receipt: item.invoiceNumber || item.transactionId,
            BookingID: item.bookingId,
            Rider: item.userName,
            Amount: item.amount,
            GST: item.gstAmount,
            Method: item.paymentMethod,
            When: item.createdAt,
            Note: item.remarks,
          }))}
        />
      </div>

      <DashboardCard title="Today’s daily receipts" subtitle="Every ₹280 + GST payment recorded today">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-8" colSpan={7}>Loading...</td></tr>
              ) : todayReceipts.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={7}>
                    No daily receipts yet today. They appear when a rider or the yard pays ₹280 + GST.
                  </td>
                </tr>
              ) : (
                todayReceipts.map((row) => (
                  <tr key={String(row.transactionId)} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{row.invoiceNumber || row.transactionId}</td>
                    <td className="px-4 py-3">{row.bookingId}</td>
                    <td className="px-4 py-3">{row.userName}</td>
                    <td className="px-4 py-3">₹{Number(row.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">₹{Number(row.gstAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{row.paymentMethod}</td>
                    <td className="px-4 py-3">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString("en-IN") : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <DashboardCard title="Contracts" subtitle="Live Rent to Own bookings">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Days paid</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Due today</th>
                <th className="px-4 py-3">Days left</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={8}>
                    No Rent to Own contracts yet.
                  </td>
                </tr>
              ) : (
                contracts.map((item) => (
                  <tr key={item.bookingId} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{item.bookingId}</td>
                    <td className="px-4 py-3">
                      {item.userName}
                      <div className="text-xs text-slate-400">{item.riderId}</div>
                    </td>
                    <td className="px-4 py-3">{item.vehicleId}</td>
                    <td className="px-4 py-3">{item.rtoInstallmentsPaid || 0}</td>
                    <td className="px-4 py-3">₹{Number(item.receivedAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">₹{Number(item.pendingAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{item.remainingRentToOwnDays || 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={item.ownershipTransferred ? "active" : "warning"}
                        label={
                          item.ownershipTransferred
                            ? "Transferred"
                            : item.paymentStatus || item.rideStatus || "Pending"
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
