import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    riderId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },

    userName: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    balance: {
      type: Number,
      default: 0,
    },

    securityDepositHold: {
      type: Number,
      default: 0,
    },

    totalRecharge: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    totalRefund: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

WalletSchema.index({ riderId: 1 });

WalletSchema.index({ userId: 1 });

WalletSchema.index({ phone: 1 });

WalletSchema.index({ status: 1 });

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", WalletSchema);