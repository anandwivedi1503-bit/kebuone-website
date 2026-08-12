import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface IHub {
  _id?: mongoose.Types.ObjectId;

  hubName: string;
  hubCode: string;
  hubLocation: string;

  hubType:
    | "Main Hub"
    | "Mini Hub"
    | "Charging Hub"
    | "Battery Swap Hub";

  city: string;

  hubManager: string;
  managerPhone: string;

  latitude: number;
  longitude: number;

  geofenceRadius: number;

  capacity: number;

  availableBikes: number;

  vehiclesInRide: number;

  vehiclesUnderMaintenance: number;

  readyBatteries: number;
  chargingBatteries: number;
  damagedBatteries: number;

  openingTime: string;
  closingTime: string;

  status:
    | "Active"
    | "Inactive"
    | "Maintenance"
    | "Closed";

  updatedBy: string;

  isDeleted: boolean;
  deletedAt?: Date;

  version: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const HubSchema =
  new Schema<IHub>(
    {
      hubName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100,
      },

      hubCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },

      hubLocation: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      hubType: {
        type: String,
        enum: [
          "Main Hub",
          "Mini Hub",
          "Charging Hub",
          "Battery Swap Hub",
        ],
        default: "Main Hub",
      },

      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
      },

      hubManager: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "",
      },

      managerPhone: {
        type: String,
        trim: true,
        default: "",
      },

      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },

      geofenceRadius: {
        type: Number,
        default: 20,
        min: 1,
      },

      capacity: {
        type: Number,
        default: 0,
        min: 0,
      },

      availableBikes: {
        type: Number,
        default: 0,
        min: 0,
      },

      vehiclesInRide: {
        type: Number,
        default: 0,
        min: 0,
      },

      vehiclesUnderMaintenance: {
        type: Number,
        default: 0,
        min: 0,
      },

      readyBatteries: {
        type: Number,
        default: 0,
        min: 0,
      },

      chargingBatteries: {
        type: Number,
        default: 0,
        min: 0,
      },

      damagedBatteries: {
        type: Number,
        default: 0,
        min: 0,
      },

      openingTime: {
        type: String,
        default: "09:00",
      },

      closingTime: {
        type: String,
        default: "21:00",
      },

      status: {
        type: String,
        enum: [
          "Active",
          "Inactive",
          "Maintenance",
          "Closed",
        ],
        default: "Active",
      },

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

      deletedAt: {
        type: Date,
      },

      version: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    {
      timestamps: true,
    }
  );

HubSchema.index({
  hubCode: 1,
});

HubSchema.index({
  status: 1,
});

HubSchema.index({
  city: 1,
});

HubSchema.index({
  hubType: 1,
});

HubSchema.index({
  isDeleted: 1,
  status: 1,
});

HubSchema.pre(
  "save",
  function (next) {
    if (this.hubName) {
      this.hubName =
        this.hubName.trim();
    }

    if (this.hubCode) {
      this.hubCode =
        this.hubCode
          .trim()
          .toUpperCase();
    }

    if (this.hubLocation) {
      this.hubLocation =
        this.hubLocation.trim();
    }

    if (this.city) {
      this.city =
        this.city.trim();
    }

    if (this.hubManager) {
      this.hubManager =
        this.hubManager.trim();
    }

    next();
  }
);

const Hub: Model<IHub> =
  mongoose.models.Hub ||
  mongoose.model<IHub>(
    "Hub",
    HubSchema
  );

export default Hub;