import mongoose from "mongoose";

const CountSchema = new mongoose.Schema(
  {
    actualAmount: { type: Number, required: true, min: 0 },
    countedBy: { type: String, trim: true, maxlength: 80, required: true },
    countedAt: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false }
);

const CashHandoverReconciliationSchema = new mongoose.Schema(
  {
    reconciliationId: { type: String, required: true, unique: true, trim: true },
    transactionIds: { type: [String], required: true, default: [] },
    bookingIds: { type: [String], required: true, default: [] },
    expectedAmount: { type: Number, required: true, min: 0 },
    actualAmount: { type: Number, required: true, min: 0 },
    varianceAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Matched", "VarianceReview"],
      required: true,
      default: "VarianceReview",
    },
    recordedBy: { type: String, trim: true, maxlength: 80, required: true },
    recordedAt: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    recounts: { type: [CountSchema], default: [] },
  },
  { timestamps: true }
);

CashHandoverReconciliationSchema.index({ status: 1, recordedAt: -1 });
CashHandoverReconciliationSchema.index({ bookingIds: 1, status: 1 });

export default mongoose.models.CashHandoverReconciliation ||
  mongoose.model("CashHandoverReconciliation", CashHandoverReconciliationSchema);
