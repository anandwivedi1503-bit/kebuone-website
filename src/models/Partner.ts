import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    organizationName: String,

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    territory: String,

    partnerType: {
      type: String,
      required: true,
    },

    investmentCapacity: String,

    propertyAvailable: String,

    availableSpace: String,

    businessExperience: String,

    plannedFleetSize: String,

    message: String,

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

export default mongoose.models.Partner ||
  mongoose.model("Partner", PartnerSchema);