import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";
import type { RideStatus, RideType, Role } from "@/types";

export interface IRide extends Document {
  passenger: Types.ObjectId;
  driver?: Types.ObjectId | null;
  pickupLocation: string;
  destination: string;
  rideType: RideType;
  notes?: string;
  status: RideStatus;
  fare: number;
  distanceKm: number;
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledBy?: Role | null;
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>(
  {
    passenger: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    pickupLocation: { type: String, required: [true, "Pickup location is required"], trim: true, maxlength: 160 },
    destination: { type: String, required: [true, "Destination is required"], trim: true, maxlength: 160 },
    rideType: { type: String, enum: ["bike", "economy", "comfort", "premium"], default: "economy" },
    notes: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: [
        "pending",
        "driver_assigned",
        "accepted",
        "on_the_way",
        "picked_up",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    fare: { type: Number, required: true, min: 0 },
    distanceKm: { type: Number, required: true, min: 0 },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledBy: { type: String, enum: ["passenger", "driver", "admin", null], default: null },
  },
  { timestamps: true }
);

rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ passenger: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });

const Ride: Model<IRide> = mongoose.models.Ride || mongoose.model<IRide>("Ride", rideSchema);
export default Ride;
