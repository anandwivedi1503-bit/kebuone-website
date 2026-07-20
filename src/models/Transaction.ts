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

    userId: String,
    userName: String,

    amount: Number,

    gstAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
  type: String,
  enum: ["Razorpay"],
  default: "Razorpay",
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
    "Booking Payment",
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
    "Failed",
    "Refunded",
  ],
  default: "Success",
},

remarks: {
  type: String,
  default: "",
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

export default mongoose.models.Transaction ||
  mongoose.model(
    "Transaction",
    TransactionSchema
  );