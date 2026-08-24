import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  id: string;
  userId: string;
  tag?: string;
  judul: string;
  isi: string;
  ts: number;
  read: boolean;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    tag: { type: String },
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    ts: { type: Number, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);
