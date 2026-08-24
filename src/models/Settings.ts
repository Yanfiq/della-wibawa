import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettingsDocument extends Document {
  userId: string;
  reminderOn: boolean;
  reminderTime: string;
  monthlyReportNotif: boolean;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    reminderOn: { type: Boolean, default: true },
    reminderTime: { type: String, default: "20:00" },
    monthlyReportNotif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SettingsModel: Model<ISettingsDocument> =
  mongoose.models.Settings ||
  mongoose.model<ISettingsDocument>("Settings", SettingsSchema);
