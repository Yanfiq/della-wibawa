import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReportDocument extends Document {
  id: string;
  userId: string;
  periode: string;
  pendapatan: number;
  beban: number;
  laba: number;
  margin: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    periode: { type: String, required: true, index: true },
    pendapatan: { type: Number, required: true },
    beban: { type: Number, required: true },
    laba: { type: Number, required: true },
    margin: { type: Number, required: true },
  },
  { timestamps: true }
);

export const ReportModel: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>("Report", ReportSchema);
