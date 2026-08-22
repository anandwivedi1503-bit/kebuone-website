import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 50,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 30,
    },

    registrationType: {
      type: String,
      enum: ["RTO", "Non-RTO"],
      default: "RTO",
    },

    chassisNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 5,
      maxlength: 50,
    },

    vehicleType: {
      type: String,
      default: "Electric Scooter",
      trim: true,
      maxlength: 50,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    batteryType: {
      type: String,
      enum: ["Chargeable", "Swappable"],
      default: "Chargeable",
    },

    // Rental Pricing
    hourlyRate: {
      type: Number,
      default: 60,
      min: 0,
    },

    dailyRate: {
      type: Number,
      default: 230,
      min: 0,
    },

    weeklyRate: {
      type: Number,
      default: 1610,
      min: 0,
    },

    monthlyRate: {
      type: Number,
      default: 6900,
      min: 0,
    },

    rentToOwnDailyRate: {
      type: Number,
      default: 280,
      min: 0,
    },

    rentToOwnMonths: {
      type: Number,
      default: 18,
      min: 1,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Vehicle Service
    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDistanceTravelled: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastServiceDate: {
      type: Date,
    },

    lastServiceOdometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    fitnessExpiry: {
      type: Date,
    },

    insuranceExpiry: {
      type: Date,
    },

    pollutionExpiry: {
      type: Date,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    updatedBy: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Battery / IoT
    batteryPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    lastBatterySwapAt: {
      type: Date,
    },

    currentBatteryId: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
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

    /*
     * IMPORTANT:
     * currentHub stores the stable Hub Code.
     * Example: HBLR001
     */
    currentHub: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 30,
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
      default: "Available",
    },

    // Operational assignment
    assignedRider: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    currentBookingId: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    currentRiderId: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    pickupOTPVerified: {
      type: Boolean,
      default: false,
    },

    rideStartedAt: {
      type: Date,
    },

    rideEndedAt: {
      type: Date,
    },

    totalTrips: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Location
    currentLatitude: {
      type: Number,
      min: -90,
      max: 90,
      default: 0,
    },

    currentLongitude: {
      type: Number,
      min: -180,
      max: 180,
      default: 0,
    },

    lastPingTime: {
      type: Date,
      default: Date.now,
    },

    // Lifecycle
    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
VehicleSchema.index({ vehicleStatus: 1 });
VehicleSchema.index({ currentHub: 1 });
VehicleSchema.index({ batteryPercentage: 1 });
VehicleSchema.index({ currentBookingId: 1 });
VehicleSchema.index({ currentRiderId: 1 });

VehicleSchema.index({
  currentHub: 1,
  vehicleStatus: 1,
});

VehicleSchema.index({
  batteryPercentage: 1,
  vehicleStatus: 1,
});

VehicleSchema.index({
  isDeleted: 1,
  isActive: 1,
  vehicleStatus: 1,
});

VehicleSchema.index({
  currentHub: 1,
  batteryPercentage: -1,
  vehicleStatus: 1,
});

VehicleSchema.index({
  currentLatitude: 1,
  currentLongitude: 1,
});

VehicleSchema.index({
  vehicleId: 1,
  version: 1,
});

VehicleSchema.pre("save", function (next) {
  if (this.vehicleId) {
    this.vehicleId = this.vehicleId.trim().toUpperCase();
  }

  if (this.registrationNumber) {
    this.registrationNumber =
      this.registrationNumber.trim().toUpperCase();
  }

  if (this.chassisNumber) {
    this.chassisNumber =
      this.chassisNumber.trim().toUpperCase();
  }

  if (this.vehicleModel) {
    this.vehicleModel = this.vehicleModel.trim();
  }

  if (this.currentHub) {
    this.currentHub =
      this.currentHub.trim().toUpperCase();
  }

  if (this.assignedRider) {
    this.assignedRider =
      this.assignedRider.trim().toUpperCase();
  }

  if (this.remarks) {
    this.remarks = this.remarks.trim();
  }

  next();
});

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);