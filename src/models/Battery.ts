import mongoose from "mongoose";

const BatterySchema = new mongoose.Schema(
  {
    batteryId: String,

    hubId: String,
    hubName: String,

    vehicleId: String,

    chargePercentage: {
      type: Number,
      default: 100,
    },

    batteryHealth: {
      type: Number,
      default: 100,
    },

    cycleCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "READY",
    },

    lastChargedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Battery ||
  mongoose.model("Battery", BatterySchema);