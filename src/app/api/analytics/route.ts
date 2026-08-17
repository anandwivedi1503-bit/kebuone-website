import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import Hub from "@/models/Hub";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { publicApiError } from "@/lib/publicError";

export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { searchParams } = new URL(req.url);

const period = searchParams.get("period") || "all";

const now = new Date();

let startDate = new Date(0);

switch (period) {
  case "today":
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    break;

  case "week":
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    break;

  case "month":
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    break;

  case "year":
    startDate = new Date(
      now.getFullYear(),
      0,
      1
    );
    break;
}

    const [
  riders,
  vehicles,
  hubs,
  bookings,
  transactions,
] = await Promise.all([
  Rider.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  }).lean(),
  Vehicle.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  }).lean(),
  Hub.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  }).lean(),
  Booking.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  }).lean(),
  Transaction.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  }).lean(),
]);

    const filteredBookings = bookings.filter(
  (b) => new Date(b.createdAt) >= startDate
);

const filteredTransactions = transactions.filter(
  (t) => new Date(t.createdAt) >= startDate
);

    const totalRevenue =
filteredTransactions
.filter(
(t)=>
t.status==="Success" &&
t.transactionType==="Booking Payment"
)
.reduce(
(sum,t)=>sum+(t.amount||0),
0
);

    const activeRides = filteredBookings.filter(
      (b) =>
        b.rideStatus === "Booked" ||
        b.rideStatus === "Reserved" ||
        b.rideStatus === "Payment Pending" ||
        b.rideStatus === "Ready For Pickup" ||
        b.rideStatus === "In Ride"
    ).length;

    const completedRides = filteredBookings.filter(
      (b) => b.rideStatus === "Completed"
    ).length;

    const bookingSuccessRate =
filteredBookings.length === 0
? 0
: Math.round(
(completedRides /
filteredBookings.length) * 100
);

    const fleetUtilization =
      vehicles.length === 0
        ? 0
        : Math.round((activeRides / vehicles.length) * 100);

    const averageRevenue =
      filteredBookings.length === 0
        ? 0
        : Math.round(totalRevenue / filteredBookings.length);

        const availableVehicles = vehicles.filter(
  (v) => v.vehicleStatus === "Available"
).length;

const inRideVehicles = vehicles.filter(
  (v) => v.vehicleStatus === "In Ride"
).length;

const maintenanceVehicles = vehicles.filter(
  (v) => v.vehicleStatus === "Maintenance"
).length;

const lowBatteryVehicles = vehicles.filter(
  (v) =>
    v.vehicleStatus === "Low Battery" ||
    Number(v.batteryPercentage || 100) <= 20
).length;

const activeRiders = riders.filter(
  (r) => r.activeRide === true
).length;

const cancelledBookings = filteredBookings.filter(
  (b) => b.rideStatus === "Cancelled"
).length;

const successfulTransactions = filteredTransactions.filter(
  (t) => t.status === "Success"
).length;

const paymentSuccessRate =
  filteredTransactions.length === 0
    ? 0
    : Math.round(
        (successfulTransactions / filteredTransactions.length) * 100
      );
      const monthlyRevenue = Array(12).fill(0);

filteredTransactions.forEach((txn) => {
  if(
txn.status!=="Success" ||
txn.transactionType!=="Booking Payment"
)
return;

  const month = new Date(txn.createdAt).getMonth();

  monthlyRevenue[month] += txn.amount || 0;
});

const monthlyBookings = Array(12).fill(0);

filteredBookings.forEach((booking) => {
  const month = new Date(booking.createdAt).getMonth();

  monthlyBookings[month]++;
});

const paymentMethods: Record<string, number> = {
  Razorpay: 0,
};

filteredTransactions.forEach((txn) => {
  const method = txn.paymentMethod || "Unknown";

  paymentMethods[method] =
    (paymentMethods[method] || 0) + 1;
});

const hubBookings: Record<string, number> = {};

filteredBookings.forEach((booking) => {
  const hub = booking.startHub || "Unknown";

  hubBookings[hub] =
    (hubBookings[hub] || 0) + 1;
});

const vehicleBookings: Record<string, number> = {};

filteredBookings.forEach((booking) => {
  const vehicle = booking.vehicleModel || "Unknown";

  vehicleBookings[vehicle] =
    (vehicleBookings[vehicle] || 0) + 1;
});

const topHubs = Object.entries(hubBookings)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const topVehicleModels = Object.entries(vehicleBookings)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const paymentDistribution = Object.entries(paymentMethods);

    return NextResponse.json({
      success: true,

      data: {
    totalRiders: riders.length,

    totalVehicles: vehicles.length,

    totalHubs: hubs.length,

    totalBookings: filteredBookings.length,

    totalTransactions: filteredTransactions.filter(
      (t) => t.status === "Success"
    ).length,

    totalRevenue,

    activeRides,

    completedRides,

    fleetUtilization,

    averageRevenue,

    availableVehicles,

    inRideVehicles,

    maintenanceVehicles,

    lowBatteryVehicles,

    activeRiders,

    cancelledBookings,

    paymentSuccessRate,

    bookingSuccessRate,

    monthlyRevenue,

    monthlyBookings,

    topHubs: topHubs || [],

topVehicleModels: topVehicleModels || [],

paymentDistribution: paymentDistribution || [],
}
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: publicApiError(error, "Failed to load analytics"),
      },
      {
        status: 500,
      }
    );
  }
}