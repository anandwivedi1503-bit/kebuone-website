import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema( 
  {
   transactionId: {
  type: String,
  required: true,
  unique: true,
},

    bookingId: {
  type: String,
  default: "",
},

    userId: {
  type: String,
  trim: true,
  default: "",
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

    gstAmount: {
      type: Number,
      default: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
    },

    cgstRate: {
      type: Number,
      default: 0.05,
    },

    sgstRate: {
      type: Number,
      default: 0.05,
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
    "Razorpay Payment Link",
  ],
  default: "Razorpay",
},

transactionSource: {
  type: String,
  enum: [
    "Mobile App",
    "Admin Panel",
    "Razorpay Webhook",
    "System",
  ],
  default: "Mobile App",
},

    razorpayOrderId: {
  type: String,
  default: "",
},

razorpayPaymentId: {
  type: String,
  unique:true,
  sparse:true,
  default: "",
},

gatewayResponseCode: {
  type: String,
  default: "",
},

invoiceNumber: {
  type: String,
  default: "",
},

invoiceGenerated: {
  type: Boolean,
  default: false,
},

refundStatus: {
  type: String,
  enum: ["None", "Pending", "Completed"],
  default: "None",
},

refundAmount: {
  type: Number,
  default: 0,
},

refundDate: {
  type: Date,
},

refundReason: {
  type: String,
  default: "",
},
    transactionType: {
  type: String,
  enum: [
    "Ride Payment",
    "Booking Payment",
    "Booking Payment - Pending Verification",
    "Security Deposit",
    "Wallet Recharge",
    "Refund",
    "Penalty",
    "Extension Payment",
    "Security Deposit Refund",
  ],
  default: "Booking Payment",
},
    status: {
  type: String,
  enum: [
    "Pending",
    "Success",
    "Pending Verification",
    "Failed",
    "Refunded",
  ],
  default: "Success",
},

remarks: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
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

version: {
  type: Number,
  default: 1,
},
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ createdAt: -1 });

TransactionSchema.index({ status: 1 });

TransactionSchema.index({ paymentMethod: 1 });

TransactionSchema.index({
  transactionId: 1,
});

TransactionSchema.index({
  bookingId: 1,
});

TransactionSchema.index({
  razorpayPaymentId: 1,
});

TransactionSchema.index({
  userId: 1,
});

TransactionSchema.index({
  transactionType: 1,
});

TransactionSchema.index({
  bookingId: 1,
  status: 1,
});

TransactionSchema.index({
  userId: 1,
  createdAt: -1,
});

TransactionSchema.index({
  paymentMethod: 1,
  status: 1,
});

TransactionSchema.index({
  transactionId: 1,
  version: 1,
});

TransactionSchema.pre("save", function (next) {

  if (this.transactionId) {
    this.transactionId =
      this.transactionId.trim().toUpperCase();
  }

  if (this.bookingId) {
    this.bookingId =
      this.bookingId.trim().toUpperCase();
  }

  if (this.userName) {
    this.userName =
      this.userName.trim();
  }

  if (this.razorpayOrderId) {
    this.razorpayOrderId =
      this.razorpayOrderId.trim();
  }

  if (this.razorpayPaymentId) {
    this.razorpayPaymentId =
      this.razorpayPaymentId.trim();
  }

  if (this.remarks) {
    this.remarks =
      this.remarks.trim();
  }

  this.amount = Math.max(0, this.amount || 0);
  this.gstAmount = Math.max(0, this.gstAmount || 0);
  this.cgstAmount = Math.max(0, this.cgstAmount || 0);
  this.sgstAmount = Math.max(0, this.sgstAmount || 0);
  this.refundAmount = Math.max(0, this.refundAmount || 0);

  next();
});

export default mongoose.models.Transaction ||
  mongoose.model(
    "Transaction",
    TransactionSchema
  );
