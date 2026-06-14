import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";

export interface IActivityLog extends Document {
  user?: Types.ObjectId;
  action: string;
  entity: "user" | "ride" | "auth" | "system";
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    entity: { type: String, enum: ["user", "ride", "auth", "system"], required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ entity: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
export default ActivityLog;
