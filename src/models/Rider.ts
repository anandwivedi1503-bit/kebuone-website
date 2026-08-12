import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema(
  {
    // Rider Identity
    riderId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    fullName: {
  type: String,
  required: true,
  trim: true,
  minlength: 3,
  maxlength: 80,
  match: /^[A-Za-z\s'.-]+$/,
},

    phone: {
  type: String,
  required: true,
  unique: true,
  index: true,
  minlength: 10,
  maxlength: 10,
  match: /^[6-9]\d{9}$/,
},

    email: {
  type: String,
  lowercase: true,
  trim: true,
  unique: true,
  sparse: true,
  maxlength: 120,
},

    // Firebase
    firebaseUid: {
  type: String,
  unique: true,
  sparse: true,
  trim: true,
},

    verifiedPhoneNumber: {
      type: String,
      default: "",
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    lastOtpVerifiedAt: Date,

    // KYC
    aadhaarNumber: {
  type: String,
  unique: true,
  sparse: true,
  minlength: 12,
  maxlength: 12,
  match: /^\d{12}$/,
},

    drivingLicense: {
  type: String,
  unique: true,
  sparse: true,
  uppercase: true,
  trim: true,
  minlength: 15,
  maxlength: 15,
  match: /^[A-Z]{2}\d{2}\d{11}$/,
},

    aadhaarFrontUrl: {
  type: String,
  default: "",
},

aadhaarBackUrl: {
  type: String,
  default: "",
},

licenseFrontUrl: {
  type: String,
  default: "",
},

licenseBackUrl: {
  type: String,
  default: "",
},

profilePhotoUrl: {
  type: String,
  default: "",
},

    kycStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    approvalStatus: {
  type: String,
  enum: [
    "Under Review",
    "Approved",
    "Rejected",
    "Suspended",
  ],
  default: "Under Review",

},
    approvedAt: Date,

    approvedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

    rejectedReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

    // Wallet
    

    securityDeposit: {
  type: Number,
  default: 0,
  min: 0,
},

    totalEarnings: {
  type: Number,
  default: 0,
  min: 0,
},

    todayEarnings: {
  type: Number,
  default: 0,
  min: 0,
},

    totalWithdrawals: {
  type: Number,
  default: 0,
  min: 0,
},

    bookingEnabled: {
  type: Boolean,
  default: false,
},

totalBookings: {
  type: Number,
  default: 0,
  min: 0,
},

completedBookings: {
  type: Number,
  default: 0,
  min: 0,
},

cancelledBookings: {
  type: Number,
  default: 0,
  min: 0,
},

averageRating: {
  type: Number,
  default: 5,
  min: 0,
  max: 5,
},

completedRideDistance: {
  type: Number,
  default: 0,
  min: 0,
},


    // Booking & Ride
    activeRide: {
      type: Boolean,
      default: false,
    },

    currentBookingId: {
  type: String,
  trim: true,
  maxlength: 50,
  default: "",
},

    currentTripId: {
  type: String,
  trim: true,
  maxlength: 50,
  default: "",
},

    currentRideStartedAt: {
  type: Date,
},

lastRideCompletedAt: {
  type: Date,
},

lastBookingId: {
  type: String,
  trim: true,
  maxlength: 50,
  default: "",
},

    // Rider Status
    status: {
  type: String,
  enum: [
    "Active",
    "Inactive",
    "Blocked",
    "Suspended",
  ],
      default: "Active",
    },

    blacklisted: {
      type: Boolean,
      default: false,
    },

    blacklistReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

    blockedAt: Date,

blockedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

updatedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

    // Emergency Contact
    emergencyContactName: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

    emergencyContactPhone: {
  type: String,
  trim: true,
  default: "",
  minlength: 10,
  maxlength: 10,
  match: /^$|^[6-9]\d{9}$/,
},

    // Optional Social
    instagramId: {
      type: String,
trim: true,
maxlength: 100,
default: "",
    },

    facebookId: {
      type: String,
trim: true,
maxlength: 100,
default: "",
    },

    // References
    reference1Name: {
      type: String,
trim: true,
maxlength: 80,
default: "",
    },

    reference1Phone: {
  type: String,
  trim: true,
  default: "",
  minlength: 10,
  maxlength: 10,
  match: /^$|^[6-9]\d{9}$/,
},

    reference2Name: {
      type: String,
trim: true,
maxlength: 80,
default: "",
    },

   reference2Phone: {
  type: String,
  trim: true,
  default: "",
  minlength: 10,
  maxlength: 10,
  match: /^$|^[6-9]\d{9}$/,
},

    // Login
    lastLogin: Date,

    lastLoginDevice: {
  type: String,
  trim: true,
  maxlength: 150,
  default: "",
},

version: {
  type: Number,
  default: 1,
},

    // Permissions
    locationPermission: {
      type: Boolean,
      default: false,
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: Date,
lastLocationUpdate: Date,
  },
  {
    timestamps: true,
  }
);

RiderSchema.index({
  phone: 1,
});

RiderSchema.index({
  riderId: 1,
});

RiderSchema.index({
  approvalStatus: 1,
});

RiderSchema.index({
  kycStatus: 1,
});

RiderSchema.index({
  activeRide: 1,
});
RiderSchema.index({
  bookingEnabled: 1,
  approvalStatus: 1,
  activeRide: 1,
});

RiderSchema.index({
  status: 1,
});

RiderSchema.index({
  currentBookingId: 1,
});

RiderSchema.index({
  lastLogin: -1,
});

RiderSchema.index({
  approvedAt: -1,
});

RiderSchema.index({
  status: 1,
  approvalStatus: 1,
  blacklisted: 1,
});

RiderSchema.index({
  bookingEnabled: 1,
  status: 1,
});

RiderSchema.index({
  riderId: 1,
  version: 1,
});

RiderSchema.index({
  firebaseUid: 1,
});

RiderSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  if (this.phone) {
    this.phone = this.phone.trim();
  }

  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }

  if (this.drivingLicense) {
    this.drivingLicense = this.drivingLicense.trim().toUpperCase();
  }

  next();
});

export default mongoose.models.Rider ||
  mongoose.model("Rider", RiderSchema);