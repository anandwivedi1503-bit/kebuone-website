import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const idRegex = /^[A-Za-z0-9_-]{3,60}$/;

const rentalModes = ["Daily", "Weekly", "Monthly"];
const batteryTypes = ["Chargeable", "Swappable"];
const registrationTypes = ["RTO", "Non-RTO"];
const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Razorpay"];
const paymentStatuses = ["Pending", "Partial", "Paid"];
const rideStatuses = ["Booked", "Reserved", "In Ride", "Completed", "Cancelled"];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
}

export async function GET() {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let lockedVehicleId = "";

  try {
    await connectDB();

    const body = await req.json();
    const bookingId = clean(body.bookingId);
    const userName = clean(body.userName);
    const userPhone = clean(body.userPhone).replace(/\D/g, "");
    const vehicleId = clean(body.vehicleId);
    const startHub = clean(body.startHub);
    const pickupHubName = clean(body.pickupHubName);
const hubAliases = Array.from(
  new Set(
    [startHub, pickupHubName, ...(Array.isArray(body.hubAliases) ? body.hubAliases : [])]
      .map(clean)
      .filter(Boolean)
  )
);
    const rentalMode = clean(body.rentalMode);
    const referenceBy = clean(body.referenceBy).slice(0, 80);

    const errors: string[] = [];

    if (!idRegex.test(bookingId)) errors.push("Valid booking ID is required.");
    const rider = await Rider.findOne({
  phone: userPhone,
});

if (!rider) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Rider is not registered. Please complete registration first."],
    },
    { status: 404 }
  );
}

if (!rider.phoneVerified) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Phone number is not verified."],
    },
    { status: 403 }
  );
}

if (rider.approvalStatus !== "Approved") {
  return NextResponse.json(
    {
      success: false,
      errors: ["Your account is still under review. Please wait for admin approval."],
    },
    { status: 403 }
  );
}

if (rider.kycStatus !== "Approved") {
  return NextResponse.json(
    {
      success: false,
      errors: ["Your KYC has not been approved yet."],
    },
    { status: 403 }
  );
}

if (rider.blacklisted) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Your account has been blocked. Please contact support."],
    },
    { status: 403 }
  );
}

if (rider.activeRide) {
  return NextResponse.json(
    {
      success: false,
      errors: ["You already have an active ride."],
    },
    { status: 409 }
  );
}
    if (!nameRegex.test(userName)) errors.push("Valid rider name is required.");
    if (!phoneRegex.test(userPhone)) errors.push("Valid Indian mobile number is required.");
    if (!idRegex.test(vehicleId)) errors.push("Valid vehicle ID is required.");
    if (hubAliases.length === 0 || hubAliases[0].length < 3) {
  errors.push("Pickup hub is required.");
}
    if (!rentalModes.includes(rentalMode)) errors.push("Valid rental mode is required.");

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      {
        vehicleId,
        currentHub: { $in: hubAliases },
        vehicleStatus: "Available",
      },
      {
        vehicleStatus: "Booked",
        assignedRider: bookingId,
        lockStatus: "Locked",
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json(
        { success: false, errors: ["Selected bike is no longer available at this hub."] },
        { status: 409 }
      );
    }

    lockedVehicleId = String(vehicle._id);

    const rentalAmount =
      rentalMode === "Daily"
        ? Number(vehicle.dailyRate || 0)
        : rentalMode === "Weekly"
        ? Number(vehicle.weeklyRate || 0)
        : Number(vehicle.monthlyRate || 0);

    const securityDeposit = Number(vehicle.securityDeposit || 2500);
    const payableAmount = rentalAmount + securityDeposit;

    if (rentalAmount <= 0 || payableAmount <= 0) {
      await Vehicle.findByIdAndUpdate(lockedVehicleId, {
        vehicleStatus: "Available",
        assignedRider: "",
        lockStatus: "Locked",
      });

      return NextResponse.json(
        { success: false, errors: ["Selected rental plan does not have a valid server price."] },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      bookingId,
      riderId: rider.riderId,
userId: rider._id,
userEmail: rider.email,
      bookingDate: new Date(),
      userName,
      userPhone,
      vehicleId: vehicle.vehicleId,
      vehicleNumber: vehicle.registrationNumber,
      chassisNumber: vehicle.chassisNumber,
      vehicleType: vehicle.vehicleType || "Electric Scooter",
      batteryType: vehicle.batteryType || "Chargeable",
      registrationType: vehicle.registrationType || "RTO",
      rentalMode,
      dailyRate: Number(vehicle.dailyRate || 0),
      weeklyRate: Number(vehicle.weeklyRate || 0),
      monthlyRate: Number(vehicle.monthlyRate || 0),
      rentalStartDate: new Date(),
      startHub: pickupHubName || startHub || vehicle.currentHub,
      securityDeposit,
      advancePaid: 0,
      totalAmount: rentalAmount,
      receivedAmount: 0,
      pendingAmount: payableAmount,
      paymentMode: "Razorpay",
      paymentStatus: "Pending",
      rideStatus: "Booked",
      referenceBy,
      remarks: `Pickup city: ${clean(body.city)}`,
    });

    await Rider.findByIdAndUpdate(rider._id, {
  activeRide: true,
  currentBookingId: booking.bookingId,
});

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (lockedVehicleId) {
      await Vehicle.findByIdAndUpdate(lockedVehicleId, {
        vehicleStatus: "Available",
        assignedRider: "",
        lockStatus: "Locked",
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
      },
      { status: 500 }
    );
  }
}