import mongoose from "mongoose";

const JobHeartbeatSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    lastRunAt: { type: Date, required: true },
    ok: { type: Boolean, default: true },
    detail: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.JobHeartbeat ||
  mongoose.model("JobHeartbeat", JobHeartbeatSchema);
