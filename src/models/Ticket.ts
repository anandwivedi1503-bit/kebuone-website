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
  "OVERCHARGING",
  "VEHICLE_BREAKDOWN",
  "PAYMENT_ISSUE",
  "REFUND_REQUEST",
  "BOOKING_ISSUE",
  "OTHER",
],
      default: "UNLOCK_ISSUE",
    },

    ticketSource: {
  type: String,
  enum: [
    "Mobile App",
    "Admin Panel",
    "Website",
    "Call Center",
    "System",
  ],
  default: "Mobile App",
},

    description: {
      type: String,
      default: "",
    },

    attachments: [
  {
    type: String,
  },
],

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    escalationLevel: {
  type: Number,
  default: 0,
  min: 0,
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

    updatedBy: {
  type: String,
  trim: true,
  maxlength: 80,
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

    lastUpdatedAt: Date,

    reopenCount: {
  type: Number,
  default: 0,
  min: 0,
},

    closedAt: Date,

    isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: Date,

version: {
  type: Number,
  default: 1,
},
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ bookingId: 1 });
TicketSchema.index({ riderId: 1 });
TicketSchema.index({
  riderId: 1,
  status: 1,
});

TicketSchema.index({
  assignedTo: 1,
  status: 1,
});

TicketSchema.index({
  priority: 1,
  status: 1,
});

TicketSchema.index({
  ticketId: 1,
  version: 1,
});
TicketSchema.index({ vehicleId: 1 });

TicketSchema.pre("save", function (next) {

  if (this.ticketId) {
    this.ticketId =
      this.ticketId.trim().toUpperCase();
  }

  if (this.bookingId) {
    this.bookingId =
      this.bookingId.trim().toUpperCase();
  }

  if (this.riderId) {
    this.riderId =
      this.riderId.trim().toUpperCase();
  }

  if (this.vehicleId) {
    this.vehicleId =
      this.vehicleId.trim().toUpperCase();
  }

  if (this.description) {
    this.description =
      this.description.trim();
  }

  if (this.adminRemarks) {
    this.adminRemarks =
      this.adminRemarks.trim();
  }

  if (this.assignedTo) {
    this.assignedTo =
      this.assignedTo.trim();
  }

  next();
});

export default mongoose.models.Ticket ||
mongoose.model("Ticket", TicketSchema);
