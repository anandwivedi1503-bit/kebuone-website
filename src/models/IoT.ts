import mongoose from "mongoose";

const IoTSchema = new mongoose.Schema(
  {
    vehicleId: String,

    batteryPercentage: Number,

    currentLat: Number,
    currentLng: Number,

    lockStatus: String,

    gpsStatus: String,

    vehicleStatus: String,

    alertType: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.IoT ||
  mongoose.model(
    "IoT",
    IoTSchema
  );