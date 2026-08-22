"use client";

import { useEffect, useMemo, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import StatusBadge from "../DashboardUI/StatusBadge";
import DashboardActions from "../DashboardUI/DashboardActions";

type BookingRow = {
  _id: string;
  bookingId: string;
  userName?: string;
  userPhone?: string;
  riderId?: string;
  vehicleId?: string;
  rentalMode?: string;
  rideStatus?: string;
  paymentStatus?: string;
  rentToOwnDailyRate?: number;
  rentToOwnMonths?: number;
  remainingRentToOwnDays?: number;
  rentToOwnCompletedDays?: number;
  rtoInstallmentsPaid?: number;
  rtoCertificateNumber?: string;
  rtoNomineeName?: string;
  rtoNomineeRelation?: string;
  rtoOccupation?: string;
  ownershipTransferred?: boolean;
  pendingAmount?: number;
  receivedAmount?: number;
};

export default function RentToOwnDashboard() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/bookings?limit=500&rentalMode=Rent%20To%20Own", { cache: "no-store" });
        const data = await res.json();
        setBookings(data.data || []);
      } finally {
        setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(interval);
  }, []);

  const rto = useMemo(
    () => bookings.filter((item) => item.rentalMode === "Rent To Own"),
    [bookings]
  );

  const active = rto.filter((item) =>
    ["Booked", "Payment Pending", "Ready For Pickup", "In Ride"].includes(
      item.rideStatus || ""
    )
  ).length;
  const transferred = rto.filter((item) => item.ownershipTransferred).length;
  const collected = rto.reduce((sum, item) => sum + Number(item.receivedAmount || 0), 0);

  return (
    <PageContainer>
      <DashboardHeader
        title="Rent to Own"
        subtitle="18-month ownership plans at ₹280/day. Same live booking records as Booking Management."
      />

      <KPIGrid>
        <KPICard title="RTO contracts" value={String(rto.length)} subtitle="All time" icon="🔑" color="green" />
        <KPICard title="Active" value={String(active)} subtitle="In progress" icon="🛵" color="blue" />
        <KPICard title="Transferred" value={String(transferred)} subtitle="Owned by rider" icon="✅" color="green" />
        <KPICard title="Collected" value={`₹${collected.toLocaleString("en-IN")}`} subtitle="Received" icon="₹" color="yellow" />
      </KPIGrid>

      <div className="mb-6">
        <DashboardActions
          filename="RentToOwn.csv"
          rows={rto.map((item) => ({
            BookingID: item.bookingId,
            Rider: item.userName,
            Vehicle: item.vehicleId,
            Certificate: item.rtoCertificateNumber,
            Pending: item.pendingAmount,
            Status: item.rideStatus,
          }))}
        />
      </div>

      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Installments</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Days left</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : rto.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={8}>
                    No Rent to Own contracts yet. They appear here after a rider completes the RTO flow.
                  </td>
                </tr>
              ) : (
                rto.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{item.bookingId}</td>
                    <td className="px-4 py-3">
                      {item.userName}
                      <div className="text-xs text-slate-400">{item.riderId}</div>
                      <div className="text-xs text-slate-400">{item.rtoOccupation || ""}</div>
                    </td>
                    <td className="px-4 py-3">{item.vehicleId}</td>
                    <td className="px-4 py-3">{item.rtoCertificateNumber || "-"}</td>
                    <td className="px-4 py-3">{item.rtoInstallmentsPaid || 0}</td>
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
