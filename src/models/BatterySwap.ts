import mongoose from "mongoose";

const BatterySwapSchema = new mongoose.Schema(
  {
    swapId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  uppercase: true,
},

    hubId: {
  type: String,
  trim: true,
  default: "",
},

hubName: {
  type: String,
  trim: true,
  default: "",
},

    vehicleId: {
  type: String,
  trim: true,
  default: "",
},

riderId: {
  type: String,
  trim: true,
  default: "",
},

    batteryOutId: {
  type: String,
  required: true,
  trim: true,
},

batteryInId: {
  type: String,
  required: true,
  trim: true,
},

batteryOutPercentage: {
  type: Number,
  default: 0,
  min: 0,
  max: 100,
},

batteryInPercentage: {
  type: Number,
  default: 100,
  min: 0,
  max: 100,
},

    staffId: {
  type: String,
  trim: true,
  default: "",
},

    status: {
  type: String,
  enum: [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
  ],
  default: "PENDING",
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
},
  },
  {
    timestamps: true,
  }
);

BatterySwapSchema.index({
  swapId: 1,
});

BatterySwapSchema.index({
  vehicleId: 1,
});

BatterySwapSchema.index({
  riderId: 1,
});

BatterySwapSchema.index({
  hubId: 1,
});

BatterySwapSchema.index({
  batteryOutId: 1,
});

BatterySwapSchema.index({
  batteryInId: 1,
});

BatterySwapSchema.index({
  status: 1,
});

BatterySwapSchema.index({
  createdAt: -1,
});

BatterySwapSchema.index({
  hubId: 1,
  status: 1,
});

BatterySwapSchema.index({
  swapId: 1,
  version: 1,
});

BatterySwapSchema.index({
  vehicleId: 1,
  createdAt: -1,
});

BatterySwapSchema.pre("save", function (next) {

  if (this.swapId) {
    this.swapId = this.swapId.trim().toUpperCase();
  }

  if (this.vehicleId) {
    this.vehicleId = this.vehicleId.trim().toUpperCase();
  }

  if (this.hubId) {
    this.hubId = this.hubId.trim().toUpperCase();
  }

  if (this.hubName) {
    this.hubName = this.hubName.trim();
  }

  if (this.batteryOutId) {
    this.batteryOutId = this.batteryOutId.trim().toUpperCase();
  }

  if (this.batteryInId) {
    this.batteryInId = this.batteryInId.trim().toUpperCase();
  }

  if (this.staffId) {
    this.staffId = this.staffId.trim();
  }

  if (this.riderId) {
    this.riderId = this.riderId.trim().toUpperCase();
  }

  if (this.remarks) {
    this.remarks = this.remarks.trim();
  }

  this.batteryOutPercentage = Math.max(
    0,
    Math.min(100, this.batteryOutPercentage)
  );

  this.batteryInPercentage = Math.max(
    0,
    Math.min(100, this.batteryInPercentage)
  );

  next();

});
export default mongoose.models.BatterySwap ||
  mongoose.model(
    "BatterySwap",
    BatterySwapSchema
  );