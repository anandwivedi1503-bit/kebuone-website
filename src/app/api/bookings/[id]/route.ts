import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Refund from "@/models/Refund";

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Razorpay"];
const paymentStatuses = ["Pending", "Partial", "Paid"];
const rideStatuses = [
  "Booked",
  "Reserved",
  "Payment Pending",
  "Ready For Pickup",
  "In Ride",
  "Completed",
  "Cancelled",
];

const allowedUpdateFields = [
  "rentalEndDate",
  "endHub",
  "receivedAmount",
  "pendingAmount",
  "paymentMode",
  "paymentStatus",
  "paymentDate",
  "rideStatus",
  "remarks",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const field of allowedUpdateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          errors: ["No valid booking update fields received."],
        },
        { status: 400 }
      );
    }

    if (
      updateData.paymentMode &&
      !paymentModes.includes(clean(updateData.paymentMode))
    ) {
      errors.push("Invalid payment mode.");
    }

    if (
      updateData.paymentStatus &&
      !paymentStatuses.includes(clean(updateData.paymentStatus))
    ) {
      errors.push("Invalid payment status.");
    }

    if (
      updateData.rideStatus &&
      !rideStatuses.includes(clean(updateData.rideStatus))
    ) {
      errors.push("Invalid ride status.");
    }

    if (
      updateData.endHub !== undefined &&
      clean(updateData.endHub).length > 0 &&
      clean(updateData.endHub).length < 3
    ) {
      errors.push("End hub is invalid.");
    }

    const amountFields = ["receivedAmount", "pendingAmount"];

    for (const field of amountFields) {
      if (
        updateData[field] !== undefined &&
        !isValidAmount(updateData[field])
      ) {
        errors.push(`${field} must be a valid non-negative amount.`);
      }
    }

    if (updateData.remarks !== undefined) {
      updateData.remarks = clean(updateData.remarks).slice(0, 300);
    }

    if (updateData.endHub !== undefined) {
      updateData.endHub = clean(updateData.endHub);
    }

    if (updateData.paymentMode !== undefined) {
      updateData.paymentMode = clean(updateData.paymentMode);
    }

    if (updateData.paymentStatus !== undefined) {
      updateData.paymentStatus = clean(updateData.paymentStatus);
    }

    if (updateData.rideStatus !== undefined) {
      updateData.rideStatus = clean(updateData.rideStatus);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

if (!booking) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Booking not found."],
    },
    { status: 404 }
  );
}

if (
  booking.rideStatus === "In Ride" ||
  booking.rideStatus === "Completed"
) {
  return NextResponse.json(
    {
      success: false,
      message: "Cannot delete completed or active bookings.",
    },
    { status: 400 }
  );
}

Object.assign(booking, updateData);

/*
|--------------------------------------------------------------------------
| Cancel Booking Workflow
|--------------------------------------------------------------------------
*/

if (
booking.rideStatus === "Completed" ||
booking.rideStatus === "In Ride"
) {
return NextResponse.json(
{
success:false,
errors:[
"Completed or active rides cannot be cancelled."
]
},
{status:400}
);
}

if (booking.rideStatus === "Cancelled") {
  const vehicle = await Vehicle.findOne({
  vehicleId: booking.vehicleId,
});

  await Vehicle.findOneAndUpdate(
    {
      vehicleId: booking.vehicleId,
    },
    {
      vehicleStatus:
  vehicle &&
  vehicle.batteryPercentage < 20
    ? "Low Battery"
    : "Available",
      assignedRider: "",
      currentBookingId: "",
      currentRiderId: "",
      lockStatus: "Locked",
    }
  );

  await Rider.findOneAndUpdate(
    {
      riderId: booking.riderId,
    },
    {
      activeRide: false,
      currentBookingId: "",
    }
  );

  /*
|--------------------------------------------------------------------------
| Release Security Deposit Hold
|--------------------------------------------------------------------------
*/

const wallet = await Wallet.findOne({
  riderId: booking.riderId,
});

if (
  wallet &&
  (booking.paymentStatus === "Paid" ||
   booking.paymentStatus === "Partial")
) {

  wallet.securityDepositHold = Math.max(
    0,
    wallet.securityDepositHold -
      Number(booking.securityDeposit || 0)
  );

  await wallet.save();

  await WalletTransaction.create({

    transactionId:
      "WTX-" +
      Date.now(),

    riderId: booking.riderId,

    userId: booking.userId,

    userName: booking.userName,

    bookingId: booking.bookingId,

    amount: booking.securityDeposit,

    paymentMethod: "Wallet",

    transactionType:
      "Security Deposit Release",

    balanceAfter: wallet.balance,

    remarks:
      "Booking Cancelled",

    status: "Success",

  });

}

/*
|--------------------------------------------------------------------------
| Create Refund Record
|--------------------------------------------------------------------------
*/

if (
  booking.paymentStatus !== "Pending" &&
  Number(booking.receivedAmount || 0) > 0
) {

  await Refund.create({

    refundId:
      "RF-" +
      Date.now(),

    bookingId:
      booking.bookingId,

    riderId:
      booking.riderId,

    amount:
      booking.receivedAmount,

    refundStatus:
      "PENDING",

    remarks:
      "Auto refund after booking cancellation",

  });

}

}

booking.pickupOTP = "";
booking.pickupOTPExpiry = null;
booking.pickupOTPVerified = false;

booking.rideStartOTP = "";
booking.rideStartOTPExpiry = null;
booking.rideStartOTPVerified = false;

booking.rideEndOTP = "";
booking.rideEndOTPExpiry = null;
booking.rideEndOTPVerified = false;

await booking.save();

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (
  booking.rideStatus === "In Ride" ||
  booking.rideStatus === "Completed"
) {
  return NextResponse.json(
    {
      success: false,
      message: "Active or completed bookings cannot be deleted.",
    },
    { status: 400 }
  );
}

if (booking.paymentStatus === "Paid") {
  return NextResponse.json(
    {
      success: false,
      message: "Paid bookings cannot be deleted.",
    },
    { status: 400 }
  );
}

    // Release Vehicle
    await Vehicle.findOneAndUpdate(
      { vehicleId: booking.vehicleId },
      {
        vehicleStatus: "Available",
        assignedRider: "",
        currentBookingId: "",
        currentRiderId: "",
        lockStatus: "Locked",
      }
    );

    // Release Rider
    await Rider.findOneAndUpdate(
      { riderId: booking.riderId },
      {
        activeRide: false,
        currentBookingId: "",
      }
    );

    // Delete Booking
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking.",
      },
      { status: 500 }
    );
  }
}