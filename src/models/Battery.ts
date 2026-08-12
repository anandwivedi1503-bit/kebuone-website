import mongoose from "mongoose";

const BatterySchema = new mongoose.Schema(
  {
    batteryId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  uppercase: true,
},

serialNumber: {
  type: String,
  trim: true,
  default: "",
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

    chargePercentage: {
      type: Number,
      default: 100,
    },

    batteryHealth: {
      type: Number,
      default: 100,
    },

    manufacturer: {
  type: String,
  trim: true,
  default: "",
},

manufacturingDate: Date,

warrantyExpiry: Date,

    cycleCount: {
      type: Number,
      default: 0,
    },

    status: {
  type: String,
  enum: [
    "READY",
    "CHARGING",
    "IN-VEHICLE",
    "IN_USE",
    "MAINTENANCE",
    "DAMAGED",
    "RETIRED",
  ],
  default: "READY",
},

    lastChargedAt: Date,
    lastSwappedAt: Date,

    updatedBy: {
  type: String,
  trim: true,
  maxlength: 80,
  default: "",
},

isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: Date,

version: {
  type: Number,
  default: 1,
},
  },
  {
    timestamps: true,
  }
);

BatterySchema.index({
    batteryId:1
});

BatterySchema.index({
    vehicleId:1
});

BatterySchema.index({
    hubId:1
});

BatterySchema.index({
    status:1
});

BatterySchema.index({
    batteryHealth:1
});

BatterySchema.index({
    chargePercentage:1
});

BatterySchema.index({
    createdAt:-1
});

BatterySchema.index({
    status:1,
    hubId:1
});

BatterySchema.index({
  batteryId: 1,
  version: 1,
});

BatterySchema.pre("save", function(next){

    if(this.batteryId){
        this.batteryId=this.batteryId.trim().toUpperCase();
    }

    if(this.serialNumber){
        this.serialNumber=this.serialNumber.trim();
    }

    if(this.vehicleId){
        this.vehicleId=this.vehicleId.trim().toUpperCase();
    }

    if(this.hubId){
        this.hubId=this.hubId.trim().toUpperCase();
    }

    if(this.hubName){
        this.hubName=this.hubName.trim();
    }

    this.chargePercentage=Math.max(
        0,
        Math.min(100,this.chargePercentage)
    );

    this.batteryHealth=Math.max(
        0,
        Math.min(100,this.batteryHealth)
    );

    this.cycleCount=Math.max(
        0,
        this.cycleCount
    );

    next();

});
export default mongoose.models.Battery ||
  mongoose.model("Battery", BatterySchema);
