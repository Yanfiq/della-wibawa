import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionPackageDocument extends Document {
  id: string;
  nama: string;
  harga: number;
  durasi: number;
  satuan: "hari" | "bulan";
  batas: number;
  fitur: string[];
  aktif: boolean;
}

const SubscriptionPackageSchema = new Schema<ISubscriptionPackageDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    nama: { type: String, required: true },
    harga: { type: Number, required: true },
    durasi: { type: Number, required: true },
    satuan: { type: String, enum: ["hari", "bulan"], default: "bulan" },
    batas: { type: Number, default: 0 },
    fitur: { type: [String], default: [] },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPackageModel: Model<ISubscriptionPackageDocument> =
  mongoose.models.SubscriptionPackage ||
  mongoose.model<ISubscriptionPackageDocument>(
    "SubscriptionPackage",
    SubscriptionPackageSchema
  );
