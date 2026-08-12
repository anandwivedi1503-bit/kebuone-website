import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    riderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      index: true,
    },

    userName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10,
      match: /^[6-9]\d{9}$/,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    securityDepositHold: {
      type: Number,
      default: 0,
      min: 0,
    },

    freezeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRecharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRefund: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastRechargeAt: {
      type: Date,
    },

    lastDebitAt: {
      type: Date,
    },

    lastRefundAt: {
      type: Date,
    },

    lastTransactionAt: {
      type: Date,
    },

    /*
     * Wallet version for optimistic/concurrency
     * tracking at application level.
     */
    version: {
      type: Number,
      default: 1,
    },

    updatedBy: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    /*
     * Wallet status.
     *
     * Active:
     * Rider is eligible to use wallet.
     *
     * Blocked:
     * Wallet cannot be used.
     */
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },

    /*
     * IMPORTANT:
     *
     * This is separate from rider approval/KYC.
     *
     * If an administrator manually blocks a wallet,
     * rider approval changes must NOT automatically
     * reactivate that wallet.
     */
    adminBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    adminBlockedAt: {
      type: Date,
    },

    adminBlockedBy: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    /*
     * Soft deletion.
     */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * =========================================================
 * INDEXES
 * =========================================================
 */

WalletSchema.index({
  riderId: 1,
});

WalletSchema.index({
  userId: 1,
});

WalletSchema.index({
  phone: 1,
});

WalletSchema.index({
  status: 1,
});

WalletSchema.index({
  status: 1,
  balance: -1,
});

WalletSchema.index({
  riderId: 1,
  updatedAt: -1,
});

WalletSchema.index({
  balance: -1,
});

WalletSchema.index({
  updatedAt: -1,
});

WalletSchema.index({
  securityDepositHold: -1,
});

WalletSchema.index({
  riderId: 1,
  version: 1,
});

WalletSchema.index({
  riderId: 1,
  status: 1,
});

WalletSchema.index({
  adminBlocked: 1,
  status: 1,
});

/*
 * =========================================================
 * PRE-SAVE NORMALIZATION
 * =========================================================
 */

WalletSchema.pre("save", function (next) {
  if (this.userName) {
    this.userName = this.userName.trim();
  }

  if (this.phone) {
    this.phone = this.phone.trim();
  }

  if (this.riderId) {
    this.riderId =
      this.riderId.trim().toUpperCase();
  }

  if (this.updatedBy) {
    this.updatedBy =
      this.updatedBy.trim();
  }

  if (this.adminBlockedBy) {
    this.adminBlockedBy =
      this.adminBlockedBy.trim();
  }

  this.balance = Math.max(
    0,
    this.balance
  );

  this.securityDepositHold =
    Math.max(
      0,
      this.securityDepositHold
    );

  this.totalRecharge =
    Math.max(
      0,
      this.totalRecharge
    );

  this.totalSpent =
    Math.max(
      0,
      this.totalSpent
    );

  this.totalRefund =
    Math.max(
      0,
      this.totalRefund
    );

  this.freezeAmount =
    Math.max(
      0,
      this.freezeAmount
    );

  next();
});

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", WalletSchema);