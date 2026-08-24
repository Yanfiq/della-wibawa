import mongoose, { Schema, Document, Model } from "mongoose";
import { TransactionType } from "@/types";

export interface ICategoryDocument extends Document {
  id: string;
  userId: string;
  nama: string;
  jenis: TransactionType;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    nama: { type: String, required: true },
    jenis: { type: String, enum: ["pemasukan", "pengeluaran"], required: true },
  },
  { timestamps: true }
);

export const CategoryModel: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);
