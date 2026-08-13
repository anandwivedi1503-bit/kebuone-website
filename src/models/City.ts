import mongoose, { Model, Schema } from "mongoose";

export interface ICity {
  _id?: mongoose.Types.ObjectId;
  cityName: string;
  state?: string;
  status: "Active" | "Inactive";
  isDeleted: boolean;
  deletedAt?: Date;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CitySchema = new Schema<ICity>(
  {
    cityName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80,
    },
    state: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: { type: Date },
    updatedBy: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
  },
  { timestamps: true }
);

CitySchema.index({ cityName: 1 });
CitySchema.index({ status: 1, isDeleted: 1 });

CitySchema.pre("save", function (next) {
  if (this.cityName) this.cityName = this.cityName.trim();
  next();
});

const City: Model<ICity> =
  mongoose.models.City ||
  mongoose.model<ICity>("City", CitySchema);

export default City;