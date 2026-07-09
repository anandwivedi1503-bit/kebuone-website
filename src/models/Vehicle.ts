import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique:true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique:true,
    },

    registrationType: {
  type: String,
  enum: ["RTO", "Non-RTO"],
  default: "RTO",
},

    chassisNumber: {
      type: String,
      required: true,
      unique:true,
    },

    vehicleType: {
      type: String,
      default: "Electric Scooter",
    },

    vehicleModel: {
      type: String,
      required: true,
    },

    batteryType: {
      type: String,
      enum: ["Chargeable", "Swappable"],
      default: "Chargeable",
    },

    dailyRate: {
      type: Number,
      default: 200,
    },

    weeklyRate: {
      type: Number,
      default: 0,
    },

    monthlyRate: {
      type: Number,
      default: 0,
    },

    securityDeposit: {
  type: Number,
  default: 0,
},

odometer: {
  type: Number,
  default: 0,
},

lastServiceDate: {
  type: Date,
},

fitnessExpiry: {
  type: Date,
},

remarks: {
  type: String,
  default: "",
},

    batteryPercentage: {
      type: Number,
      default: 100,
    },

    gpsStatus: {
  type: String,
  enum: ["ONLINE", "OFFLINE"],
  default: "ONLINE",
},

    lockStatus: {
  type: String,
  enum: ["Locked", "Unlocked"],
  default: "Locked",
},

    currentHub: {
      type: String,
      default: "Main Hub",
    },

    vehicleStatus: {
      type: String,
      enum: [
        "Available",
        "Booked",
        "In Ride",
        "Maintenance",
        "Low Battery",
      ],
      default: "Available",
    },

    assignedRider: {
      type: String,
      default: "",
    },

    currentBookingId: {
  type: String,
  default: "",
},

currentRiderId: {
  type: String,
  default: "",
},

    insuranceExpiry: {
      type: Date,
    },

    pollutionExpiry: {
      type: Date,
    },

    currentLatitude: {
  type: Number,
  default: 0,
},

currentLongitude: {
  type: Number,
  default: 0,
},

lastPingTime: {
  type: Date,
  default: Date.now,
},

isActive: {
  type: Boolean,
  default: true,
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);