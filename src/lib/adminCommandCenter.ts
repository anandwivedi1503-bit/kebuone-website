import { parseOpsQuery, universalOpsSearch, type OpsHit } from "@/lib/opsSearch";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { REVENUE_TRANSACTION_TYPES } from "@/lib/opsRevenue";
import { sessionHasAnyDashboard, type AdminSessionInfo } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import {
  applyHubScope,
  idInScopeFilter,
  scopedBookingIds,
  scopedRiderIds,
  sessionHubScope,
} from "@/lib/staffHubScope";
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

export async function getAdminCommandCenter(session: AdminSessionInfo) {
  await connectDB();

  const hubCodes = sessionHubScope(session);
  const bookingFilter = applyHubScope(
    { ...NOT_DELETED_FILTER },
    hubCodes,
    ["currentHub", "startHub"]
  );
  const vehicleFilter = applyHubScope(
    { ...NOT_DELETED_FILTER },
    hubCodes,
    ["currentHub"]
  );
  const hubFilter = hubCodes
    ? { ...NOT_DELETED_FILTER, hubCode: { $in: hubCodes } }
    : NOT_DELETED_FILTER;
  const batteryFilter = hubCodes
    ? { ...NOT_DELETED_FILTER, hubId: { $in: hubCodes } }
    : NOT_DELETED_FILTER;
  const bookingIds = await scopedBookingIds(session);
  const riderIds = await scopedRiderIds(session);
  const ticketFilter = {
    ...NOT_DELETED_FILTER,
    ...idInScopeFilter("bookingId", bookingIds),
  };
  const refundFilter = {
    ...NOT_DELETED_FILTER,
    ...idInScopeFilter("bookingId", bookingIds),
  };
  const txFilter = {
    ...NOT_DELETED_FILTER,
    ...idInScopeFilter("bookingId", bookingIds),
  };
  const walletFilter = {
    ...NOT_DELETED_FILTER,
    ...idInScopeFilter("riderId", riderIds),
  };
  const riderFilter = {
    ...NOT_DELETED_FILTER,
    ...idInScopeFilter("riderId", riderIds),
  };
  const vehicleIds = hubCodes
    ? (
        await Vehicle.distinct("vehicleId", vehicleFilter)
      ).map((id) => String(id || "").trim())
    : null;
  const iotFilter = vehicleIds
    ? {
        ...NOT_DELETED_FILTER,
        vehicleId: { $in: vehicleIds.length ? vehicleIds : ["__none__"] },
      }
    : NOT_DELETED_FILTER;

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
    Rider.countDocuments(riderFilter).maxTimeMS(2500),
    Vehicle.countDocuments(vehicleFilter).maxTimeMS(2500),
    Hub.countDocuments(hubFilter).maxTimeMS(2500),
    Hub.countDocuments({ ...hubFilter, status: "Active" }).maxTimeMS(2500),
    Vehicle.countDocuments({
      ...vehicleFilter,
      vehicleStatus: "Available",
    }).maxTimeMS(2500),
    Booking.countDocuments({ ...bookingFilter, rideStatus: "In Ride" }).maxTimeMS(2500),
    Ticket.countDocuments({ ...ticketFilter, status: "OPEN" }).maxTimeMS(2500),
    Refund.countDocuments({
      ...refundFilter,
      refundStatus: { $in: ["PROCESSING", "PENDING"] },
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...iotFilter,
      gpsStatus: "ONLINE",
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...iotFilter,
      gpsStatus: "OFFLINE",
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...iotFilter,
      batteryPercentage: { $lte: 20 },
    }).maxTimeMS(2500),
    IoT.countDocuments({
      ...iotFilter,
      alertType: { $nin: [null, ""] },
    }).maxTimeMS(2500),
    Battery.countDocuments({ ...batteryFilter, status: "READY" }).maxTimeMS(2500),
    Battery.countDocuments({ ...batteryFilter, status: "CHARGING" }).maxTimeMS(2500),
    Battery.countDocuments({
      ...batteryFilter,
      chargePercentage: { $lte: 20 },
    }).maxTimeMS(2500),
    BatterySwap.countDocuments({ ...batteryFilter, status: "PENDING" }).maxTimeMS(2500),
    BatterySwap.countDocuments({ ...batteryFilter, status: "COMPLETED" }).maxTimeMS(2500),
    Partner.countDocuments({ applicationStatus: "Pending" }).maxTimeMS(2500),
    Partner.countDocuments({ applicationStatus: "Approved" }).maxTimeMS(2500),
    Wallet.countDocuments(walletFilter).maxTimeMS(2500),
    Wallet.countDocuments({
      ...walletFilter,
      $or: [{ status: "Blocked" }, { adminBlocked: true }],
    }).maxTimeMS(2500),
    Wallet.aggregate([
      {
        $match: {
          ...walletFilter,
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
          ...txFilter,
          status: "Success",
          transactionType: { $in: [...REVENUE_TRANSACTION_TYPES] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Booking.find(bookingFilter)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Transaction.find(txFilter)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Ticket.find(ticketFilter)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Refund.find(refundFilter)
      .select(leanRecent)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    BatterySwap.find(batteryFilter)
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

  return filterCommandCenterForSession(session, { counts, recent });
}

function emptyIf(allowed: boolean, rows: Array<Record<string, unknown>>) {
  return allowed ? rows : [];
}

function filterCommandCenterForSession(
  session: AdminSessionInfo,
  snapshot: { counts: CommandCenterCounts; recent: CommandCenterRecent }
) {
  const { counts, recent } = snapshot;
  const canBookings = sessionHasAnyDashboard(session, ...API_DASHBOARDS.bookingsRead);
  const canTickets = sessionHasAnyDashboard(session, ...API_DASHBOARDS.tickets);
  const canRefunds = sessionHasAnyDashboard(session, ...API_DASHBOARDS.refunds);
  const canRiders = sessionHasAnyDashboard(session, ...API_DASHBOARDS.ridersRead);
  const canVehicles = sessionHasAnyDashboard(session, ...API_DASHBOARDS.vehiclesRead);
  const canHubs = sessionHasAnyDashboard(session, ...API_DASHBOARDS.hubsRead);
  const canIot = sessionHasAnyDashboard(session, ...API_DASHBOARDS.iot);
  const canBatteries = sessionHasAnyDashboard(session, ...API_DASHBOARDS.batteries);
  const canSwaps = sessionHasAnyDashboard(session, ...API_DASHBOARDS.swaps);
  const canPartners = sessionHasAnyDashboard(session, ...API_DASHBOARDS.partners);
  const canWallet = sessionHasAnyDashboard(session, ...API_DASHBOARDS.walletRead);
  const canTx = sessionHasAnyDashboard(session, ...API_DASHBOARDS.transactions);

  if (!canRiders) counts.riders = 0;
  if (!canVehicles) {
    counts.vehicles = 0;
    counts.availableVehicles = 0;
    counts.onlineVehicles = 0;
    counts.offlineVehicles = 0;
    counts.lowBatteryVehicles = 0;
  }
  if (!canHubs) {
    counts.hubs = 0;
    counts.activeHubs = 0;
  }
  if (!canBookings) {
    counts.activeRides = 0;
    recent.bookings = [];
  }
  if (!canTickets) {
    counts.openTickets = 0;
    recent.tickets = [];
  }
  if (!canRefunds) {
    counts.processingRefunds = 0;
    recent.refunds = [];
  }
  if (!canIot) counts.geofenceAlerts = 0;
  if (!canBatteries) {
    counts.readyBatteries = 0;
    counts.chargingBatteries = 0;
    counts.lowChargeBatteries = 0;
  }
  if (!canSwaps) {
    counts.pendingSwaps = 0;
    counts.completedSwaps = 0;
    recent.batterySwaps = [];
  }
  if (!canPartners) {
    counts.pendingPartners = 0;
    counts.approvedPartners = 0;
    recent.partners = [];
  }
  if (!canWallet) {
    counts.wallets = 0;
    counts.blockedWallets = 0;
    counts.totalWalletBalance = 0;
  }
  if (!canTx && !canWallet) counts.totalRevenue = 0;
  recent.transactions = emptyIf(canTx, recent.transactions);

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
