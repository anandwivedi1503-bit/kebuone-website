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
  Rider.find().lean(),
  Vehicle.find().lean(),
  Hub.find().lean(),
  Booking.find().lean(),
  Transaction.find().lean(),
]);

    const filteredBookings = bookings.filter(
  (b) => new Date(b.createdAt) >= startDate
);

const filteredTransactions = transactions.filter(
  (t) => new Date(t.createdAt) >= startDate
);

    const totalRevenue = filteredTransactions
      .filter((t) => t.status === "Success")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeRides = filteredBookings.filter(
  (b) =>
    b.rideStatus === "Booked" ||
    b.rideStatus === "In Ride" ||
    b.rideStatus === "Started"
).length;

    const completedRides = filteredBookings.filter(
      (b) => b.rideStatus === "Completed"
    ).length;

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
  if (txn.status !== "Success") return;

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
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}