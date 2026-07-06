import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema(
  {
    refundId: String,

    ticketId: String,

    amount: Number,

    gatewayTxnId: String,

    refundStatus: {
      type: String,
      default: "PROCESSING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Refund ||
  mongoose.model("Refund", RefundSchema);