import mongoose, { Schema, type Model, type Document } from "mongoose";
import type { Role, Vehicle } from "@/types";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  isOnline: boolean; // drivers only
  vehicle?: Vehicle; // drivers only
  rating: number;
  totalEarnings: number;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<Vehicle>(
  {
    name: { type: String, trim: true },
    number: { type: String, trim: true, uppercase: true },
    licenseNumber: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: [true, "Full name is required"], trim: true, minlength: 3, maxlength: 60 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["passenger", "driver", "admin"], default: "passenger", index: true },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    vehicle: {
      type: vehicleSchema,
      required: function (this: IUser) {
        return this.role === "driver";
      },
    },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isOnline: 1 });
userSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
