import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentStatus } from "@/types";

export interface IPaymentRequestDocument extends Document {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  method: string;
  proof: string;
  submittedAt: string;
  status: PaymentStatus;
  adminNote?: string;
  verifiedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequestDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    packageId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "Pembayaran Manual / Demo" },
    proof: { type: String, required: true },
    submittedAt: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
    verifiedAt: { type: String, default: null },
  },
  { timestamps: true }
);

export const PaymentRequestModel: Model<IPaymentRequestDocument> =
  mongoose.models.PaymentRequest ||
  mongoose.model<IPaymentRequestDocument>("PaymentRequest", PaymentRequestSchema);
