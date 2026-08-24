import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBusinessProfileDocument extends Document {
  userId: string;
  namaUsaha: string;
  jenisUsaha: string;
  pemilik: string;
  email: string;
  hp: string;
  alamat: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessProfileSchema = new Schema<IBusinessProfileDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    namaUsaha: { type: String, default: "" },
    jenisUsaha: { type: String, default: "" },
    pemilik: { type: String, default: "" },
    email: { type: String, default: "" },
    hp: { type: String, default: "" },
    alamat: { type: String, default: "" },
  },
  { timestamps: true }
);

export const BusinessProfileModel: Model<IBusinessProfileDocument> =
  mongoose.models.BusinessProfile ||
  mongoose.model<IBusinessProfileDocument>("BusinessProfile", BusinessProfileSchema);
