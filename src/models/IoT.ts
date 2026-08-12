import mongoose from "mongoose";

const IoTSchema = new mongoose.Schema(
  {
    vehicleId: {
  type: String,
  required: true,
  trim: true,
  uppercase: true,
  index: true,
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

    speed: {
  type: Number,
  default: 0,
  min: 0,
},

heading: {
  type: Number,
  default: 0,
},

ignition: {
  type: Boolean,
  default: false,
},

    lockStatus: {
  type: String,
  enum: [
    "Locked",
    "Unlocked",
  ],
  required: true,
},

    gpsStatus: {
  type: String,
  enum: [
    "ONLINE",
    "OFFLINE",
  ],
  required: true,
},

    vehicleStatus: {
  type: String,
  enum: [
    "Available",
    "Booked",
    "Ready For Pickup",
    "In Ride",
    "Maintenance",
    "Low Battery",
  ],
  required: true,
},

    alertType: {
  type: String,
  enum: [
    "",
    "LOW_BATTERY",
    "OVERSPEED",
    "GEOFENCE",
    "GPS_LOST",
    "LOCK_TAMPER",
    "ACCIDENT",
  ],
  default: "",
},

signalStrength: {
  type: Number,
  default: 0,
},

deviceTimestamp: Date,
  },
  {
  timestamps: true,
  }
);

IoTSchema.index({ vehicleId: 1 });
IoTSchema.index({ createdAt: -1 });
IoTSchema.index({
  vehicleId: 1,
  createdAt: -1,
});

IoTSchema.index({
  vehicleStatus: 1,
});

IoTSchema.index({
  gpsStatus: 1,
});

IoTSchema.index({
  alertType: 1,
});

IoTSchema.index({
  batteryPercentage: 1,
});

IoTSchema.index({
  vehicleId: 1,
  alertType: 1,
});

IoTSchema.index({
  deviceTimestamp: -1,
});

IoTSchema.pre("save", function (next) {

  if (this.vehicleId) {
    this.vehicleId = this.vehicleId.trim().toUpperCase();
  }

  this.batteryPercentage = Math.max(
    0,
    Math.min(100, this.batteryPercentage)
  );

  next();

});

export default mongoose.models.IoT ||
  mongoose.model(
    "IoT",
    IoTSchema
  );