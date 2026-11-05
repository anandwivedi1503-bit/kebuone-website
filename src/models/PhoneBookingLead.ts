import mongoose from "mongoose";

const PhoneBookingLeadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
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
      index: true,
    },
    altPhone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "Lucknow",
    },
    rentalMode: {
      type: String,
      trim: true,
      default: "",
    },
    vehiclePreference: {
      type: String,
      trim: true,
      default: "",
    },
    pickupDate: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: ["OPEN", "CONTACTED", "BOOKED", "LOST"],
      default: "OPEN",
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "Helpdesk",
    },
    linkedBookingId: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "Helpdesk call +91 8726006519",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PhoneBookingLead ||
  mongoose.model("PhoneBookingLead", PhoneBookingLeadSchema);
