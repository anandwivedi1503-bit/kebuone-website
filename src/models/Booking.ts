import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // Booking Details
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    // Customer Details
    userId: String,
    userName: String,
    userPhone: String,

    // Vehicle Details
    vehicleId: String,
    vehicleNumber: String,
    chassisNumber: String,

    vehicleType: {
      type: String,
      default: "Electric Scooter",
    },

    batteryType: {
      type: String,
      enum: ["Chargeable", "Swappable"],
      default: "Chargeable",
    },

    registrationType: {
      type: String,
      enum: ["RTO", "Non-RTO"],
      default: "RTO",
    },

    // Rental Details
    rentalMode: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      default: "Daily",
    },

    dailyRate: {
      type: Number,
      default: 0,
    },

    weeklyRate: {
      type: Number,
      default: 0,
    },

    monthlyRate: {
      type: Number,
      default: 0,
    },

    rentalStartDate: Date,

    rentalEndDate: Date,

    // Hub Details
    startHub: String,
    endHub: String,

    // Financial Details
    securityDeposit: {
      type: Number,
      default: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    receivedAmount: {
      type: Number,
      default: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
    },

    // Payment
    paymentMode: {
  type: String,
  enum: ["Cash", "UPI", "Card", "Bank Transfer", "Razorpay"],
  default: "Razorpay",
},
    paymentDate: Date,

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    // Ride Status
    rideStatus: {
      type: String,
      enum: [
        "Booked",
        "Reserved",
        "In Ride",
        "Completed",
        "Cancelled",
      ],
      default: "Booked",
    },

    // Reference
    referenceBy: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);