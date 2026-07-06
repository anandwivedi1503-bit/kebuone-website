import mongoose from "mongoose";

const HubSchema = new mongoose.Schema(
  {
    hubName: {
      type: String,
      required: true,
    },

    hubCode: {
      type: String,
      required: true,
    },

    hubLocation: {
      type: String,
      required: true,
    },

    latitude: Number,
    longitude: Number,

    geofenceRadius: {
      type: Number,
      default: 20,
    },

    capacity: {
      type: Number,
      default: 0,
    },

    availableBikes: {
      type: Number,
      default: 0,
    },

    readyBatteries: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Hub ||
  mongoose.model("Hub", HubSchema);