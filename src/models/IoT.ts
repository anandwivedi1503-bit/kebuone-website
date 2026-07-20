import mongoose from "mongoose";

const IoTSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },

    batteryPercentage: {
      type: Number,
      required: true,
    },

    currentLat: {
      type: Number,
      required: true,
    },

    currentLng: {
      type: Number,
      required: true,
    },

    lockStatus: {
      type: String,
      required: true,
    },

    gpsStatus: {
      type: String,
      required: true,
    },

    vehicleStatus: {
      type: String,
      required: true,
    },

    alertType: {
      type: String,
      default: "",
    },
  },
  {
  timestamps: true,
  }
);

IoTSchema.index({ vehicleId: 1 });
IoTSchema.index({ createdAt: -1 });

export default mongoose.models.IoT ||
  mongoose.model(
    "IoT",
    IoTSchema
  );