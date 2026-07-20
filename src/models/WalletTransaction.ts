import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    riderId: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },

    userName: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        "Recharge",
        "Booking Payment",
        "Refund",
        "Security Deposit Hold",
        "Security Deposit Release",
        "Admin Credit",
        "Admin Debit",
      ],
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Wallet",
        "Cash",
        "UPI",
        "Card",
        "Bank Transfer",
        "Razorpay",
      ],
      default: "Wallet",
    },

    bookingId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    balanceAfter: {
  type: Number,
  default: 0,
},

    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

WalletTransactionSchema.index({ riderId: 1 });

WalletTransactionSchema.index({ bookingId: 1 });

WalletTransactionSchema.index({ razorpayPaymentId: 1 });

WalletTransactionSchema.index({ createdAt: -1 });

WalletTransactionSchema.index({ transactionType: 1 });

WalletTransactionSchema.index({ status: 1 });

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);