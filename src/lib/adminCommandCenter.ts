import { parseOpsQuery, universalOpsSearch, type OpsHit } from "@/lib/opsSearch";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { REVENUE_TRANSACTION_TYPES } from "@/lib/opsRevenue";
import type { AdminSessionInfo } from "@/lib/adminAuth";
import Battery from "@/models/Battery";
import BatterySwap from "@/models/BatterySwap";
import Booking from "@/models/Booking";
import Hub from "@/models/Hub";
import IoT from "@/models/IoT";
import Partner from "@/models/Partner";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";

export type CommandCenterCounts = {
  riders: number;
  vehicles: number;
  hubs: number;
  activeHubs: number;
  availableVehicles: number;
  activeRides: number;
  openTickets: number;
  processingRefunds: number;
  onlineVehicles: number;
  offlineVehicles: number;
  lowBatteryVehicles: number;
  geofenceAlerts: number;
  readyBatteries: number;
  chargingBatteries: number;
  lowChargeBatteries: number;
  pendingSwaps: number;
  completedSwaps: number;
  pendingPartners: number;
  approvedPartners: number;
  wallets: number;
  blockedWallets: number;
  totalWalletBalance: number;
  totalRevenue: number;
};

export type CommandCenterRecent = {
  bookings: Array<Record<string, unknown>>;
  transactions: Array<Record<string, unknown>>;
  tickets: Array<Record<string, unknown>>;
  refunds: Array<Record<string, unknown>>;
  batterySwaps: Array<Record<string, unknown>>;
  partners: Array<Record<string, unknown>>;
};

const leanRecent = {
  createdAt: 1,
  bookingId: 1,
  userName: 1,
  userPhone: 1,
  paymentStatus: 1,
  receivedAmount: 1,
  pendingAmount: 1,
  vehicleId: 1,
  rideStatus: 1,
  amount: 1,
  transactionId: 1,
  ticketId: 1,
  category: 1,
  refundStatus: 1,
  status: 1,
  applicationStatus: 1,
  _id: 1,
} as const;

export async function getAdminCommandCenter() {
  await connectDB();

  const [
    riders,
    vehicles,
    hubs,
    activeHubs,
    availableVehicles,
    activeRides,
    openTickets,
    processingRefunds,
    onlineVehicles,
    offlineVehicles,
    lowBatteryVehicles,
    geofenceAlerts,
    readyBatteries,
    chargingBatteries,
    lowChargeBatteries,
    pendingSwaps,
    completedSwaps,
    pendingPartners,
    approvedPartners,
    wallets,
    blockedWallets,
    walletBalanceAgg,
    revenueAgg,
    recentBookings,
    recentTransactions,
    recentTickets,
    recentRefunds,
    recentSwaps,
    recentPartners,
  ] = await Promise.all([
    Rider.countDocuments(NOT_DELETED_FILTER).maxTimeMS(2500),
    Vehicle.countDocuments(NOT_DELETED_FILTER).maxTimeMS(2500),
    Hub.countDocuments(NOT_DELETED_FILTER).maxTimeMS(2500),
    Hub.countDocuments({ ...NOT_DELETED_FILTER, status: "Active" }).maxTimeMS(2500),
    Vehicle.countDocuments({
      ...NOT_DELETED_FILTER,
      vehicleStatus: "Available",
    }).maxTimeMS(2500),
    Booking.countDocuments({ ...NOT_DELETED_FILTER, rideStatus: "In Ride" }).maxTimeMS(2500),
    Ticket.countDocuments({ ...NOT_DELETED_FILTER, status: "OPEN" }).maxTimeMS(2500),
    Refund.countDocuments({
      ...NOT_DELETED_FILTER,
      refundStatus: { $in: ["PROCESSING", "PENDING"] },
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...NOT_DELETED_FILTER,
      gpsStatus: "ONLINE",
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...NOT_DELETED_FILTER,
      gpsStatus: "OFFLINE",
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...NOT_DELETED_FILTER,
      batteryPercentage: { $lte: 20 },
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...NOT_DELETED_FILTER,
      alertType: { $nin: [null, ""] },
    }).maxTimeMS(2500),
    Battery.countDocuments({ ...NOT_DELETED_FILTER, status: "READY" }).maxTimeMS(2500),
    Battery.countDocuments({ ...NOT_DELETED_FILTER, status: "CHARGING" }).maxTimeMS(2500),
    Battery.countDocuments({
      ...NOT_DELETED_FILTER,
      chargePercentage: { $lte: 20 },
    }).maxTimeMS(2500),
    BatterySwap.countDocuments({ ...NOT_DELETED_FILTER, status: "PENDING" }).maxTimeMS(2500),
    BatterySwap.countDocuments({ ...NOT_DELETED_FILTER, status: "COMPLETED" }).maxTimeMS(2500),
    Partner.countDocuments({ applicationStatus: "Pending" }).maxTimeMS(2500),
    Partner.countDocuments({ applicationStatus: "Approved" }).maxTimeMS(2500),
    Wallet.countDocuments(NOT_DELETED_FILTER).maxTimeMS(2500),
    Wallet.countDocuments({
      ...NOT_DELETED_FILTER,
      $or: [{ status: "Blocked" }, { adminBlocked: true }],
    }).maxTimeMS(2500),
    Wallet.aggregate([
      {
        $match: {
          ...NOT_DELETED_FILTER,
          status: { $ne: "Blocked" },
          adminBlocked: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $max: [
                0,
                {
                  $subtract: [
                    { $ifNull: ["$balance", 0] },
                    { $ifNull: ["$freezeAmount", 0] },
                  ],
                },
              ],
            },
          },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          ...NOT_DELETED_FILTER,
          status: "Success",
          transactionType: { $in: [...REVENUE_TRANSACTION_TYPES] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Booking.find(NOT_DELETED_FILTER)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Transaction.find(NOT_DELETED_FILTER)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Ticket.find(NOT_DELETED_FILTER)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Refund.find(NOT_DELETED_FILTER)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    BatterySwap.find(NOT_DELETED_FILTER)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Partner.find()
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const counts: CommandCenterCounts = {
    riders,
    vehicles,
    hubs,
    activeHubs,
    availableVehicles,
    activeRides,
    openTickets,
    processingRefunds,
    onlineVehicles,
    offlineVehicles,
    lowBatteryVehicles,
    geofenceAlerts,
    readyBatteries,
    chargingBatteries,
    lowChargeBatteries,
    pendingSwaps,
    completedSwaps,
    pendingPartners,
    approvedPartners,
    wallets,
    blockedWallets,
    totalWalletBalance: Number(walletBalanceAgg[0]?.total || 0),
    totalRevenue: Number(revenueAgg[0]?.total || 0),
  };

  const recent: CommandCenterRecent = {
    bookings: recentBookings as Array<Record<string, unknown>>,
    transactions: recentTransactions as Array<Record<string, unknown>>,
    tickets: recentTickets as Array<Record<string, unknown>>,
    refunds: recentRefunds as Array<Record<string, unknown>>,
    batterySwaps: recentSwaps as Array<Record<string, unknown>>,
    partners: recentPartners as Array<Record<string, unknown>>,
  };

  return { counts, recent };
}

export async function searchCommandCenter(
  session: AdminSessionInfo,
  q: string
): Promise<OpsHit[]> {
  const asked = String(q || "").trim().slice(0, 120);
  if (asked.length < 2) return [];
  const result = await universalOpsSearch(session, parseOpsQuery(asked));
  return result.hits.slice(0, 20);
}
