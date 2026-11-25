"use client";

import { useEffect, useRef, useState } from "react";
import { startOpsPoll } from "@/lib/opsPoll";

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

type RtoSummary = {
  total?: number;
  active?: number;
  transferred?: number;
  received?: number;
  todayReceiptCount?: number;
  todayReceived?: number;
};

export default function RentToOwnDashboard() {
  const [contracts, setContracts] = useState<BookingRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [summary, setSummary] = useState<RtoSummary>({});
  const contractCursorRef = useRef("");
  const receiptCursorRef = useRef("");
  const loadingMoreContractsRef = useRef(false);
  const loadingMoreReceiptsRef = useRef(false);
  const [hasMoreContracts, setHasMoreContracts] = useState(false);
  const [hasMoreReceipts, setHasMoreReceipts] = useState(false);
  const [loadingMoreContracts, setLoadingMoreContracts] = useState(false);
  const [loadingMoreReceipts, setLoadingMoreReceipts] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (loadOlderContracts = false, loadOlderReceipts = false) => {
    if (loadOlderContracts && (!contractCursorRef.current || loadingMoreContractsRef.current)) return;
    if (loadOlderReceipts && (!receiptCursorRef.current || loadingMoreReceiptsRef.current)) return;
    if (loadOlderContracts) {
      loadingMoreContractsRef.current = true;
      setLoadingMoreContracts(true);
    }
    if (loadOlderReceipts) {
      loadingMoreReceiptsRef.current = true;
      setLoadingMoreReceipts(true);
    }
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (loadOlderContracts) params.set("contractCursor", contractCursorRef.current);
      if (loadOlderReceipts) params.set("receiptCursor", receiptCursorRef.current);
      const res = await fetch(`/api/rto/daily-ledger?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to load Rent to Own ledger.");
      const contractRows = Array.isArray(data.data?.contracts) ? data.data.contracts : [];
      const receiptRows = Array.isArray(data.data?.receipts) ? data.data.receipts : [];
      setContracts((current) => {
        const key = (row: BookingRow) => String(row.bookingId || row._id || "");
        if (loadOlderContracts) {
          const seen = new Set(current.map(key));
          return [...current, ...contractRows.filter((row: BookingRow) => !seen.has(key(row)) && Boolean(seen.add(key(row))))];
        }
        const seen = new Set(contractRows.map(key));
        return [...contractRows, ...current.filter((row) => !seen.has(key(row)))];
      });
      setReceipts((current) => {
        const key = (row: ReceiptRow) => String(row._id || row.transactionId || "");
        if (loadOlderReceipts) {
          const seen = new Set(current.map(key));
          return [...current, ...receiptRows.filter((row: ReceiptRow) => !seen.has(key(row)) && Boolean(seen.add(key(row))))];
        }
        const seen = new Set(receiptRows.map(key));
        return [...receiptRows, ...current.filter((row) => !seen.has(key(row)))];
      });
      if (loadOlderContracts || !contractCursorRef.current) {
        contractCursorRef.current = String(data.contractPagination?.nextCursor || "");
      }
      if (loadOlderReceipts || !receiptCursorRef.current) {
        receiptCursorRef.current = String(data.receiptPagination?.nextCursor || "");
      }
      if (!loadOlderReceipts) setHasMoreContracts(Boolean(data.contractPagination?.hasMore));
      if (!loadOlderContracts) setHasMoreReceipts(Boolean(data.receiptPagination?.hasMore));
      if (loadOlderContracts) setHasMoreContracts(Boolean(data.contractPagination?.hasMore));
      if (loadOlderReceipts) setHasMoreReceipts(Boolean(data.receiptPagination?.hasMore));
      setSummary(data.summary || {});
    } finally {
      setLoading(false);
      if (loadOlderContracts) {
        loadingMoreContractsRef.current = false;
        setLoadingMoreContracts(false);
      }
      if (loadOlderReceipts) {
        loadingMoreReceiptsRef.current = false;
        setLoadingMoreReceipts(false);
      }
    }
  };

  useEffect(() => {
    void load();
    return startOpsPoll(load);
  }, []);

  const active = Number(summary.active ?? contracts.filter((item) =>
    ["Booked", "Payment Pending", "Ready For Pickup", "In Ride"].includes(item.rideStatus || "")
  ).length);
  const transferred = Number(summary.transferred ?? contracts.filter((item) => item.ownershipTransferred).length);
  const collected = Number(summary.received ?? contracts.reduce((sum, item) => sum + Number(item.receivedAmount || 0), 0));
  const todayTotal = Number(summary.todayReceived ?? todayReceipts.reduce((sum, row) => sum + Number(row.amount || 0), 0));

  return (
    <PageContainer>
      <DashboardHeader
        title="Rent to Own"
        subtitle="₹300 GST included every day. Each payment is a receipt for the rider and a line on this ledger."
      />
      <OpsMoneyStrip />

      <KPIGrid>
        <KPICard title="Contracts" value={String(summary.total ?? contracts.length)} subtitle="All time" icon="🔑" color="green" />
        <KPICard title="Active" value={String(active)} subtitle="In progress" icon="🛵" color="blue" />
        <KPICard title="Today collected" value={`₹${todayTotal.toLocaleString("en-IN")}`} subtitle={`${Number(summary.todayReceiptCount ?? todayReceipts.length)} daily receipts`} icon="🧾" color="yellow" />
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

      <DashboardCard title="RTO daily receipts" subtitle="All successful daily payments, newest first">
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
              ) : receipts.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={7}>
                    No daily receipts yet today. They appear when a rider or the yard pays the GST-included daily fare.
                  </td>
                </tr>
              ) : (
                receipts.map((row) => (
                  <tr key={String(row.transactionId)} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{row.invoiceNumber || row.transactionId}</td>
                    <td className="px-4 py-3">{row.bookingId}</td>
                    <td className="px-4 py-3">{row.userName}</td>
                    <td className="px-4 py-3">₹{Number(row.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">₹{Number(row.gstAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{row.paymentMethod}</td>
                    <td className="px-4 py-3">{row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
      {hasMoreReceipts ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={loadingMoreReceipts}
            onClick={() => void load(false, true)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
          >
            {loadingMoreReceipts ? "Loading…" : "Load older daily receipts"}
          </button>
        </div>
      ) : null}

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
      {hasMoreContracts ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={loadingMoreContracts}
            onClick={() => void load(true, false)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
          >
            {loadingMoreContracts ? "Loading…" : "Load older contracts"}
          </button>
        </div>
      ) : null}
    </PageContainer>
  );
}
