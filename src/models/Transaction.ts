import mongoose, { Schema, Document, Model } from "mongoose";
import { TransactionType, FinancialAccountType } from "@/types";

export interface ITransactionDocument extends Document {
  id: string;
  userId: string;
  tanggal: string;
  jenis: TransactionType;
  kategori: string;
  nominal: number;
  akunKeuangan: FinancialAccountType;
  deskripsi: string;
  bukti: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    tanggal: { type: String, required: true, index: true },
    jenis: { type: String, enum: ["pemasukan", "pengeluaran"], required: true },
    kategori: { type: String, required: true },
    nominal: { type: Number, required: true },
    akunKeuangan: { type: String, enum: ["usaha", "pribadi"], default: "usaha", index: true },
    deskripsi: { type: String, default: "" },
    bukti: { type: String, default: null },
  },
  { timestamps: true }
);

export const TransactionModel: Model<ITransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);
