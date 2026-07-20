import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    bookingId: {
      type: String,
      default: "",
      index: true,
    },

    riderId: {
      type: String,
      default: "",
      index: true,
    },

    userId: {
      type: String,
      default: "",
    },

    tripId: {
      type: String,
      default: "",
    },

    vehicleId: {
      type: String,
      default: "",
      index: true,
    },

    riderPhone: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "UNLOCK_ISSUE",
        "LOCK_ISSUE",
        "PAYMENT",
        "BOOKING",
        "BATTERY",
        "ACCIDENT",
        "BREAKDOWN",
        "REFUND",
        "OTHER",
      ],
      default: "UNLOCK_ISSUE",
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN-PROGRESS",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },

    assignedTo: {
      type: String,
      default: "",
    },

    adminRemarks: {
      type: String,
      default: "",
    },

    refundRequired: {
      type: Boolean,
      default: false,
    },

    refundId: {
      type: String,
      default: "",
    },

    resolvedAt: Date,

    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ bookingId: 1 });
TicketSchema.index({ riderId: 1 });
TicketSchema.index({ vehicleId: 1 });

export default mongoose.models.Ticket ||
mongoose.model("Ticket", TicketSchema);