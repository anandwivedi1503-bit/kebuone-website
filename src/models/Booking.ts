import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // Booking Details
    bookingId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  uppercase: true,
},

bookingRequestId: {
    type: String,
    unique: true,
    sparse: true,
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

userName: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

userPhone: {
  type: String,
  trim: true,
  minlength: 10,
  maxlength: 10,
  match: /^[6-9]\d{9}$/,
  default: "",
},

userEmail: {
  type: String,
  trim: true,
  lowercase: true,
  maxlength: 120,
  default: "",
},

    // Vehicle Details
   vehicleId: {
  type: String,
  required: true,
  trim: true,
  index: true,
},

vehicleNumber: {
  type: String,
  trim: true,
  uppercase: true,
  default: "",
},

chassisNumber: {
  type: String,
  trim: true,
  uppercase: true,
  default: "",
},

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
    min: 0,
    max: 100,
},

    registrationType: {
      type: String,
      enum: ["RTO", "Non-RTO"],
      default: "RTO",
    },

    // Rental Details
    rentalMode: {
      type: String,
      enum: [
  "Hourly",
  "Daily",
  "Weekly",
  "Monthly",
  "Rent To Own",
],
      default: "Daily",
    },

    dailyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    weeklyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    hourlyRate: {
  type: Number,
  default: 0,
  min: 0,
},

rentToOwnDailyRate: {
  type: Number,
  default: 0,
  min: 0,
},

rentToOwnMonths: {
  type: Number,
  default: 0,
  min: 0,
},

rentToOwnCompletedDays: {
  type: Number,
  default: 0,
  min: 0,
},

remainingRentToOwnDays: {
  type: Number,
  default: 0,
  min: 0,
},

ownershipTransferred: {
  type: Boolean,
  default: false,
},

ownershipTransferredAt: Date,

rtoNomineeName: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

rtoNomineeRelation: {
  type: String,
  trim: true,
  maxlength: 40,
  default: "",
},

rtoGuardianName: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

rtoEmergencyPhone: {
  type: String,
  trim: true,
  maxlength: 10,
  default: "",
},

rtoEmail: {
  type: String,
  trim: true,
  lowercase: true,
  maxlength: 120,
  default: "",
},

rtoPermanentAddress: {
  type: String,
  trim: true,
  maxlength: 240,
  default: "",
},

rtoOccupation: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

rtoAgreementAccepted: {
  type: Boolean,
  default: false,
},

rtoAgreementAcceptedAt: Date,

rtoCertificateNumber: {
  type: String,
  trim: true,
  default: "",
},

rtoInstallmentsPaid: {
  type: Number,
  default: 0,
  min: 0,
},

    rentalStartDate: {
  type: Date,
  required: true,
},

rentalEndDate: {
  type: Date,
  required: true,
},

    actualRideStart: Date,

actualRideEnd: Date,

completedAt: Date,

expectedReturnDate: Date,

totalRideMinutes: {
  type: Number,
  default: 0,
  min: 0,
},

rideDistanceKm: {
  type: Number,
  default: 0,
  min: 0,
},

startOdometer: {
  type: Number,
  default: 0,
  min: 0,
},

endOdometer: {
  type: Number,
  default: 0,
  min: 0,
},

    // Hub Details
    startHub: {
  type: String,
  trim: true,
  default: "",
},

currentHub: {
  type: String,
  trim: true,
  default: "",
},

pickupCity: {
  type: String,
  trim: true,
  default: "",
},

lastLatitude: {
  type: Number,
  default: null,
},

lastLongitude: {
  type: Number,
  default: null,
},

lastGpsAt: {
  type: Date,
  default: null,
},

endHub: {
  type: String,
  trim: true,
  default: "",
},
   pickupLatitude: {
  type: Number,
  default: 0,
},

pickupLongitude: {
  type: Number,
  default: 0,
},

dropLatitude: {
  type: Number,
  default: 0,
},

dropLongitude: {
  type: Number,
  default: 0,
},

    // Financial Details
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgstRate: {
      type: Number,
      default: 0.025,
      min: 0,
    },

    sgstRate: {
      type: Number,
      default: 0.025,
      min: 0,
    },

    rateApplied: {
  type: Number,
  default: 0,
  min: 0,
},

    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentDue: {
  type: Number,
  default: 0,
  min: 0,
},

   refundAmount: {
  type: Number,
  default: 0,
  min: 0,
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
  trim: true,
  default: "",
},

razorpayPaymentId: {
  type: String,
  trim: true,
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
  trim: true,
  maxlength: 100,
  default: "",
},

    
  cancellationReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

    cancelledBy: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},

remarks: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

invoiceGenerated: {
  type: Boolean,
  default: false,
},

invoiceNumber: {
  type: String,
  trim: true,
  default: "",
},

pickupOTP: {
  type: String,
  trim: true,
  maxlength: 6,
  default: "",
  validate: {
    validator(value: string) {
      return !value || /^\d{6}$/.test(value);
    },
    message: "Pickup OTP must be 6 digits when generated.",
  },
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
  trim: true,
  maxlength: 6,
  default: "",
  validate: {
    validator(value: string) {
      return !value || /^\d{6}$/.test(value);
    },
    message: "Ride start OTP must be 6 digits when generated.",
  },
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
  trim: true,
  maxlength: 6,
  default: "",
  validate: {
    validator(value: string) {
      return !value || /^\d{6}$/.test(value);
    },
    message: "Ride end OTP must be 6 digits when generated.",
  },
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

bookingSource: {
  type: String,
  enum: [
    "Mobile App",
    "Admin Panel",
    "Partner",
  ],
  default: "Mobile App",
},

version: {
  type: Number,
  default: 1,
},

updatedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: Date,
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

BookingSchema.index({
  vehicleId: 1,
  rideStatus: 1,
});

BookingSchema.index({
  riderId: 1,
  rideStatus: 1,
});

BookingSchema.index({
  paymentStatus: 1,
  rideStatus: 1,
});

BookingSchema.index({
  rentalStartDate: 1,
});

BookingSchema.index({
  rentalEndDate: 1,
});

BookingSchema.index({
  razorpayOrderId: 1,
});

BookingSchema.index({
  razorpayPaymentId: 1,
});

BookingSchema.index({
    bookingId:1
});

BookingSchema.index({
    userId:1
});

BookingSchema.index({
    currentHub:1
});

BookingSchema.index({
    pickupCity:1
});

BookingSchema.index({
  rideStatus: 1,
  currentHub: 1,
});

BookingSchema.index({
  riderId: 1,
  bookingDate: -1,
});

BookingSchema.index({
  vehicleId: 1,
  bookingDate: -1,
});

BookingSchema.index({
  bookingId: 1,
  version: 1,
});

BookingSchema.index({
  riderId: 1,
  rideStatus: 1,
  paymentStatus: 1,
});

BookingSchema.index({
  razorpayPaymentId: 1,
  paymentStatus: 1,
});

BookingSchema.index({
  paymentStatus: 1,
  rideStatus: 1,
  createdAt: 1,
});

BookingSchema.index({
  rideEndOTP: 1,
});

BookingSchema.pre("save", function (next) {

    if (this.userEmail) {
        this.userEmail = this.userEmail.trim().toLowerCase();
    }

    if (this.vehicleNumber) {
        this.vehicleNumber = this.vehicleNumber.trim().toUpperCase();
    }

    if (this.chassisNumber) {
        this.chassisNumber = this.chassisNumber.trim().toUpperCase();
    }

    next();
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema); 
