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

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    gatewayTxnId: {
      type: String,
      default: "",
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

    remarks: {
      type: String,
      default: "",
    },

    processedBy: {
      type: String,
      default: "",
    },

    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

RefundSchema.index({ createdAt: -1 });
RefundSchema.index({ refundStatus: 1 });
RefundSchema.index({ bookingId: 1 });

export default mongoose.models.Refund ||
mongoose.model("Refund", RefundSchema);