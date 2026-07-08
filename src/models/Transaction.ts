import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: String,

    bookingId: String,

    userId: String,
    userName: String,

    amount: Number,

    gstAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: String,

    razorpayOrderId: {
  type: String,
  default: "",
},

razorpayPaymentId: {
  type: String,
  default: "",
},

invoiceNumber: {
  type: String,
  default: "",
},

refundStatus: {
  type: String,
  enum: ["None", "Pending", "Completed"],
  default: "None",
},

    transactionType: {
      type: String,
      default: "Ride Payment",
    },

    status: {
      type: String,
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model(
    "Transaction",
    TransactionSchema
  );