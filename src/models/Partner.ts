import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    fullName: String,

    phone: String,

    email: String,

    organizationName: String,

    state: String,

    city: String,

    territory: String,

    partnerType: String,

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
      default: "Pending",
    },

    assignedManager: String,

    reviewedDate: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Partner ||
  mongoose.model("Partner", PartnerSchema);