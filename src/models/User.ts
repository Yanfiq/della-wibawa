import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IUserDocument extends Document {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  aktif: boolean;
  trialStart: string;
  trialEnd: string;
  namaUsaha: string;
  jenisUsaha: string;
  plan: string;
  subStatusManual: string | null;
  subStart?: string | null;
  subEnd?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    aktif: { type: Boolean, default: true },
    trialStart: { type: String, required: true },
    trialEnd: { type: String, required: true },
    namaUsaha: { type: String, default: "" },
    jenisUsaha: { type: String, default: "" },
    plan: { type: String, default: "pkg_trial" },
    subStatusManual: { type: String, default: null },
    subStart: { type: String, default: null },
    subEnd: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
