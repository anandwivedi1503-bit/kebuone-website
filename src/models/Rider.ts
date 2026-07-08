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
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // Firebase
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      default: "",
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
    },

    drivingLicense: {
      type: String,
      default: "",
    },

    aadhaarFileUrl: {
      type: String,
      default: "",
    },

    licenseFileUrl: {
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
      ],
      default: "Under Review",
    },

    approvedAt: Date,

    approvedBy: {
      type: String,
      default: "",
    },

    rejectedReason: {
      type: String,
      default: "",
    },

    // Wallet
    walletBalance: {
      type: Number,
      default: 0,
    },

    walletFrozen: {
      type: Boolean,
      default: false,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    todayEarnings: {
      type: Number,
      default: 0,
    },

    totalWithdrawals: {
      type: Number,
      default: 0,
    },

    // Booking & Ride
    activeRide: {
      type: Boolean,
      default: false,
    },

    currentBookingId: {
      type: String,
      default: "",
    },

    currentTripId: {
      type: String,
      default: "",
    },

    // Rider Status
    status: {
      type: String,
      enum: [
        "Active",
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
      default: "",
    },

    // Emergency Contact
    emergencyContactName: {
      type: String,
      default: "",
    },

    emergencyContactPhone: {
      type: String,
      default: "",
    },

    // Optional Social
    instagramId: {
      type: String,
      default: "",
    },

    facebookId: {
      type: String,
      default: "",
    },

    // References
    reference1Name: {
      type: String,
      default: "",
    },

    reference1Phone: {
      type: String,
      default: "",
    },

    reference2Name: {
      type: String,
      default: "",
    },

    reference2Phone: {
      type: String,
      default: "",
    },

    // Login
    lastLogin: Date,

    lastLoginDevice: {
      type: String,
      default: "",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Rider ||
  mongoose.model("Rider", RiderSchema);