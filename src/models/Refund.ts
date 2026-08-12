import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema(
  {
    refundId: {
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

    ticketId: {
      type: String,
      default: "",
      index: true,
    },

    
    riderId: {
      type: String,
      default: "",
    },

    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Rider",
},

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    gatewayTxnId: {
      type: String,
      default: "",
    },

    paymentGateway: {
  type: String,
  enum: [
    "Wallet",
    "Razorpay",
    "Cash",
    "Bank Transfer",
  ],
  default: "Razorpay",
},

    razorpayRefundId: {
      type: String,
      default: "",
    },

    refundStatus: {
      type: String,
      enum: [
        "PROCESSING",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "REFUNDED",
        "FAILED",
      ],
      default: "PROCESSING",
    },

    failureReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

    refundSource: {
  type: String,
  enum: [
    "Booking Cancellation",
    "Security Deposit",
    "Admin",
    "Ticket",
  ],
  default: "Booking Cancellation",
},

    remarks: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

processedBy: {
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



    processedAt: Date,

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

RefundSchema.index({ createdAt: -1 });
RefundSchema.index({ refundStatus: 1 });
RefundSchema.index({ bookingId: 1 });
RefundSchema.index({
  riderId: 1,
  refundStatus: 1,
});

RefundSchema.index({
  refundStatus: 1,
  createdAt: -1,
});

RefundSchema.index({
  riderId: 1,
});

RefundSchema.index({
  processedAt: -1,
});

RefundSchema.pre("save", function (next) {

  if (this.refundId) {
    this.refundId =
      this.refundId.trim().toUpperCase();
  }

  if (this.bookingId) {
    this.bookingId =
      this.bookingId.trim().toUpperCase();
  }

  if (this.ticketId) {
    this.ticketId =
      this.ticketId.trim().toUpperCase();
  }

  if (this.riderId) {
    this.riderId =
      this.riderId.trim().toUpperCase();
  }

  if (this.gatewayTxnId) {
    this.gatewayTxnId =
      this.gatewayTxnId.trim();
  }

  if (this.razorpayRefundId) {
    this.razorpayRefundId =
      this.razorpayRefundId.trim();
  }

  if (this.remarks) {
    this.remarks =
      this.remarks.trim();
  }

  if (this.processedBy) {
    this.processedBy =
      this.processedBy.trim();
  }

  this.amount = Math.max(0, this.amount || 0);

  next();
});

export default mongoose.models.Refund ||
mongoose.model("Refund", RefundSchema);