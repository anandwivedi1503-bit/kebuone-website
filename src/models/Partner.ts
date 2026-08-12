import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    fullName: {
  type: String,
  required: true,
  trim: true,
  maxlength: 80,
},

    phone: {
  type: String,
  required: true,
  trim: true,
  minlength: 10,
  maxlength: 10,
  match: /^[6-9]\d{9}$/,
},

    email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  maxlength: 120,
},

    organizationName: {
  type: String,
  trim: true,
  maxlength: 150,
  default: "",
},

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    territory: {
  type: String,
  trim: true,
  maxlength: 150,
  default: "",
},

    partnerType: {
      type: String,
      required: true,
    },

    investmentCapacity: String,

    propertyAvailable: String,

    availableSpace: String,

    businessExperience: String,

    plannedFleetSize: String,

    message: {
  type: String,
  trim: true,
  maxlength: 1000,
  default: "",
},

    consentAccepted: {
      type: Boolean,
      default: false,
    },

    applicationStatus: {
  type: String,
  enum: [
    "Pending",
    "Approved",
    "Rejected",
  ],
  default: "Pending",
},

    assignedManager: {
  type: String,
  default: "Unassigned",
},

priority: {
  type: String,
  enum: ["High", "Medium", "Low"],
  default: "Medium",
},

applicationStage: {
  type: String,
  enum: [
    "New",
    "Under Review",
    "Meeting Scheduled",
    "Documents Pending",
    "Documents Verified",
    "Business Evaluation",
    "Approved",
    "Agreement Signed",
    "Onboarding",
    "Live Partner",
    "Rejected",
  ],
  default: "New",
},

documentStatus: {
  type: String,
  enum: [
    "Pending",
    "Uploaded",
    "Verified",
    "Rejected",
  ],
  default: "Pending",
},

followUpDate: Date,

meetingDate: Date,

meetingNotes: {
  type: String,
  default: "",
},

adminRemarks: {
  type: String,
  default: "",
},

reviewedDate: Date,
approvedDate: Date,
  },
  {
    timestamps: true,
  }
);

PartnerSchema.index({ applicationStatus: 1 });

PartnerSchema.index({ applicationStage: 1 });

PartnerSchema.index({ assignedManager: 1 });

PartnerSchema.index({ priority: 1 });

PartnerSchema.index({ city: 1 });

PartnerSchema.index({ state: 1 });

PartnerSchema.index({ partnerType: 1 });

PartnerSchema.index({
  phone: 1,
});

PartnerSchema.index({
  email: 1,
});

PartnerSchema.index({
  reviewedDate: -1,
});

PartnerSchema.index({
  followUpDate: 1,
});

PartnerSchema.index({
  meetingDate: 1,
});

PartnerSchema.index({
  phone: 1,
  applicationStatus: 1,
});

PartnerSchema.pre("save", function (next) {

  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  if (this.phone) {
    this.phone = this.phone.trim();
  }

  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }

  if (this.organizationName) {
    this.organizationName =
      this.organizationName.trim();
  }

  next();

});

export default mongoose.models.Partner ||
  mongoose.model("Partner", PartnerSchema);