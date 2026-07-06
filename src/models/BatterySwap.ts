import mongoose from "mongoose";

const BatterySwapSchema = new mongoose.Schema(
  {
    swapId: String,

    hubId: String,
    hubName: String,

    vehicleId: String,

    batteryOutId: String,
    batteryInId: String,

    staffId: String,

    status: {
      type: String,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BatterySwap ||
  mongoose.model(
    "BatterySwap",
    BatterySwapSchema
  );