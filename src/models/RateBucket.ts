import mongoose from "mongoose";

const RateBucketSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: false }
);

RateBucketSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateBucket ||
  mongoose.model("RateBucket", RateBucketSchema);
