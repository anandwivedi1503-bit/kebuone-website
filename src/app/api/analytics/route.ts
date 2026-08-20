import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import Hub from "@/models/Hub";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { publicApiError } from "@/lib/publicError";

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

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
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const createdInPeriod = { createdAt: { $gte: startDate } };

    const [
      totalRiders,
      totalVehicles,
      totalHubs,
      totalBookings,
      successfulTransactions,
      totalRevenueAgg,
      activeRides,
      completedRides,
      cancelledBookings,
      totalTransactionsInPeriod,
      availableVehicles,
      inRideVehicles,
      maintenanceVehicles,
      lowBatteryVehicles,
      activeRiders,
      monthlyRevenueAgg,
      monthlyBookingsAgg,
      paymentMethodsAgg,
      hubBookingsAgg,
      vehicleBookingsAgg,
    ] = await Promise.all([
      Rider.countDocuments(NOT_DELETED),
      Vehicle.countDocuments(NOT_DELETED),
      Hub.countDocuments(NOT_DELETED),
      Booking.countDocuments({ ...NOT_DELETED, ...createdInPeriod }),
      Transaction.countDocuments({
        ...NOT_DELETED,
        ...createdInPeriod,
        status: "Success",
      }),
      Transaction.aggregate([
        { $match: { ...NOT_DELETED, ...createdInPeriod, status: "Success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.countDocuments({
        ...NOT_DELETED,
        rideStatus: {
          $in: ["Booked", "Reserved", "Payment Pending", "Ready For Pickup", "In Ride"],
        },
      }),
      Booking.countDocuments({ ...NOT_DELETED, ...createdInPeriod, rideStatus: "Completed" }),
      Booking.countDocuments({ ...NOT_DELETED, ...createdInPeriod, rideStatus: "Cancelled" }),
      Transaction.countDocuments({ ...NOT_DELETED, ...createdInPeriod }),
      Vehicle.countDocuments({ ...NOT_DELETED, vehicleStatus: "Available" }),
      Vehicle.countDocuments({ ...NOT_DELETED, vehicleStatus: "In Ride" }),
      Vehicle.countDocuments({ ...NOT_DELETED, vehicleStatus: "Maintenance" }),
      Vehicle.countDocuments({
        ...NOT_DELETED,
        $or: [{ vehicleStatus: "Low Battery" }, { batteryPercentage: { $lte: 20 } }],
      }),
      Rider.countDocuments({ ...NOT_DELETED, activeRide: true }),
      Transaction.aggregate([
        {
          $match: {
            ...NOT_DELETED,
            status: "Success",
            transactionType: "Booking Payment",
            createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
          },
        },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            ...NOT_DELETED,
            createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
          },
        },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { ...NOT_DELETED, ...createdInPeriod } },
        { $group: { _id: "$paymentMethod", total: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { ...NOT_DELETED, ...createdInPeriod } },
        { $group: { _id: "$startHub", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
      Booking.aggregate([
        { $match: { ...NOT_DELETED, ...createdInPeriod } },
        { $group: { _id: "$vehicleModel", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = Number(totalRevenueAgg[0]?.total || 0);
    const bookingSuccessRate =
      totalBookings === 0 ? 0 : Math.round((completedRides / totalBookings) * 100);
    const fleetUtilization =
      totalVehicles === 0 ? 0 : Math.round((activeRides / totalVehicles) * 100);
    const averageRevenue =
      totalBookings === 0 ? 0 : Math.round(totalRevenue / totalBookings);
    const paymentSuccessRate =
      totalTransactionsInPeriod === 0
        ? 0
        : Math.round((successfulTransactions / totalTransactionsInPeriod) * 100);

    const monthlyRevenue = Array(12).fill(0);
    monthlyRevenueAgg.forEach((row: { _id: number; total: number }) => {
      if (row._id >= 1 && row._id <= 12) monthlyRevenue[row._id - 1] = row.total;
    });
    const monthlyBookings = Array(12).fill(0);
    monthlyBookingsAgg.forEach((row: { _id: number; total: number }) => {
      if (row._id >= 1 && row._id <= 12) monthlyBookings[row._id - 1] = row.total;
    });

    const paymentMethods: Record<string, number> = { Razorpay: 0 };
    paymentMethodsAgg.forEach((row: { _id?: string; total: number }) => {
      const method = row._id || "Unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + row.total;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRiders,
        totalVehicles,
        totalHubs,
        totalBookings,
        totalTransactions: successfulTransactions,
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
        topHubs: hubBookingsAgg.map((row: { _id?: string; total: number }) => [
          row._id || "Unknown",
          row.total,
        ]),
        topVehicleModels: vehicleBookingsAgg.map((row: { _id?: string; total: number }) => [
          row._id || "Unknown",
          row.total,
        ]),
        paymentDistribution: Object.entries(paymentMethods),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: publicApiError(error, "Failed to load analytics") },
      { status: 500 }
    );
  }
}
