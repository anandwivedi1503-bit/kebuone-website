import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: String,

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    firebaseUid: {
  type: String,
  default: "",
},

verifiedPhoneNumber: {
  type: String,
  default: "",
},

    aadhaarNumber: String,
    drivingLicense: String,

    aadhaarFileUrl: String,
    licenseFileUrl: String,
    profilePhotoUrl: String,

    instagramId: String,
    facebookId: String,

    reference1Name: String,
    reference1Phone: String,

    reference2Name: String,
    reference2Phone: String,

    kycStatus: {
      type: String,
      default: "Pending",
    },

    approvalStatus: {
      type: String,
      default: "Under Review",
    },

    approvedAt: Date,
    approvedBy: String,
    rejectedReason: String,

    walletBalance: {
      type: Number,
      default: 0,
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

    activeRide: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Rider ||
  mongoose.model("Rider", RiderSchema);