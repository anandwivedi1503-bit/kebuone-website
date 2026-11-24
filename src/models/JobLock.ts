import mongoose from "mongoose";

const JobLockSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    ownerToken: { type: String, required: true },
    leaseUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.JobLock || mongoose.model("JobLock", JobLockSchema);
