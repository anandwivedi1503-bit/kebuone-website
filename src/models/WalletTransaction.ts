import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  uppercase: true,
  minlength: 8,
  maxlength: 50,
  index: true,
},

    riderId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 3,
    maxlength: 20,
    index: true,
},

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },

   userName: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
},

    amount: {
    type: Number,
    required: true,
    min: 0,
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

    transactionSource: {
  type: String,
  enum: [
    "Mobile App",
    "Admin Panel",
    "System",
    "Razorpay",
  ],
  default: "System",
},

    bookingId: {
    type: String,
    trim: true,
    maxlength: 50,
    default: "",
},

    razorpayPaymentId: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "",
},

    razorpayOrderId: {
       type: String,
    trim: true,
    maxlength: 100,
    default: "",
    },

    remarks: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
},

    balanceAfter: {
    type: Number,
    default: 0,
    min: 0,
},

    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success",
    },

    updatedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: Date,
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

WalletTransactionSchema.index({
    riderId: 1,
    transactionType: 1,
});

WalletTransactionSchema.index({
    bookingId: 1,
    createdAt: -1,
});

WalletTransactionSchema.index({
    paymentMethod: 1,
    createdAt: -1,
});

WalletTransactionSchema.index({ status: 1 });

WalletTransactionSchema.index({
    transactionId: 1,
});

WalletTransactionSchema.index({
    userId: 1,
});

WalletTransactionSchema.index({
    paymentMethod: 1,
});

WalletTransactionSchema.index({
    riderId: 1,
    createdAt: -1,
});

WalletTransactionSchema.index({
    bookingId: 1,
    transactionType: 1,
});

WalletTransactionSchema.index({
    status: 1,
    createdAt: -1,
});

WalletTransactionSchema.pre("save", function (next) {

    if (this.transactionId) {
        this.transactionId =
            this.transactionId.trim().toUpperCase();
    }

    if (this.riderId) {
        this.riderId =
            this.riderId.trim().toUpperCase();
    }

    if (this.userName) {
        this.userName =
            this.userName.trim();
    }

    if (this.bookingId) {
        this.bookingId =
            this.bookingId.trim();
    }

    if (this.remarks) {
        this.remarks =
            this.remarks.trim();
    }

    this.amount = Math.max(0, this.amount);

    this.balanceAfter = Math.max(
        0,
        this.balanceAfter
    );

    if (this.razorpayPaymentId) {
    this.razorpayPaymentId =
        this.razorpayPaymentId.trim();
}

if (this.razorpayOrderId) {
    this.razorpayOrderId =
        this.razorpayOrderId.trim();
}

    next();
});

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);