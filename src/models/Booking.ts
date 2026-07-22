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

    bookingTime: {
  type: Date,
  default: Date.now,
},

    // Customer Details
riderId: {
  type: String,
  default: "",
},

userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Rider",
},

userName: String,

userPhone: String,

userEmail: {
  type: String,
  default: "",
},

    // Vehicle Details
    vehicleId: String,
    vehicleNumber: String,
    chassisNumber: String,

    vehicleType: {
      type: String,
      default: "Electric Scooter",
    },

    vehicleModel: {
  type: String,
  default: "",
},

    batteryType: {
      type: String,
      enum: ["Chargeable", "Swappable"],
      default: "Chargeable",
    },

    batteryPercentage: {
  type: Number,
  default: 100,
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

    actualRideStart: Date,

actualRideEnd: Date,

completedAt: Date,

expectedReturnDate: Date,

totalRideMinutes: {
  type: Number,
  default: 0,
},

rideDistanceKm: {
  type: Number,
  default: 0,
},

startOdometer: {
  type: Number,
  default: 0,
},

endOdometer: {
  type: Number,
  default: 0,
},

    // Hub Details
    startHub: String,
    currentHub: String,
pickupCity: String,
    endHub: String,
   pickupLatitude: Number,

pickupLongitude: Number,

dropLatitude: Number,

dropLongitude: Number,

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

    paymentDue: {
  type: Number,
  default: 0,
},

   refundAmount: {
  type: Number,
  default: 0,
},

securityDepositRefunded: {
  type: Boolean,
  default: false,
}, 

    // Payment
    paymentMode: {
  type: String,
  enum: ["Cash", "UPI", "Card", "Bank Transfer", "Razorpay"],
  default: "Razorpay",
},
    paymentDate: Date,

    razorpayOrderId: {
  type: String,
  default: "",
},

razorpayPaymentId: {
  type: String,
  default: "",
},

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
    "Payment Pending",
    "Ready For Pickup",
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

    cancelledBy: {
  type: String,
  default: "",
},

cancellationReason: {
  type: String,
  default: "",
},

invoiceGenerated: {
  type: Boolean,
  default: false,
},

invoiceNumber: {
  type: String,
  default: "",
},

pickupOTP: {
  type: String,
  default: "",
},

pickupOTPExpiry: {
  type: Date,
},

pickupOTPVerified: {
  type: Boolean,
  default: false,
},

pickupOTPVerifiedAt: {
  type: Date,
},

rideStartOTP: {
  type: String,
  default: "",
},

rideStartOTPExpiry: {
  type: Date,
},

rideStartOTPVerified: {
  type: Boolean,
  default: false,
},

rideEndOTP: {
  type: String,
  default: "",
},

rideEndOTPExpiry: {
  type: Date,
},

rideEndOTPVerified: {
  type: Boolean,
  default: false,
},

rideEndOTPVerifiedAt: {
  type: Date,
},

paymentVerifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ createdAt: -1 });

BookingSchema.index({ rideStatus: 1 });

BookingSchema.index({ startHub: 1 });

BookingSchema.index({ vehicleModel: 1 });

BookingSchema.index({ bookingDate: -1 });

BookingSchema.index({
  vehicleId: 1,
});

BookingSchema.index({
  riderId: 1,
});

BookingSchema.index({
  paymentStatus: 1,
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema); 
