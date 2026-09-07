import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    riderId: {
      type: String,
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      default: "EVUDDY rider",
      maxlength: 80,
    },
    vehicleId: {
      type: String,
      default: "",
      index: true,
    },
    hubCode: {
      type: String,
      default: "",
      index: true,
    },
    city: {
      type: String,
      default: "",
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    vehicleStars: {
      type: Number,
      min: 1,
      max: 5,
      default: undefined,
    },
    hubStars: {
      type: Number,
      min: 1,
      max: 5,
      default: undefined,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Published", "Hidden"],
      default: "Pending",
      index: true,
    },
    staffReply: {
      type: String,
      default: "",
      maxlength: 500,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ hubCode: 1, status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
