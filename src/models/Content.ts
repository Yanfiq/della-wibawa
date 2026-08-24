import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContentDocument extends Document {
  key: string;
  tagline: string;
  sub: string;
  tentang: string;
  wa: string;
  aboutTitle: string;
  about: string;
  visi: string;
  misi: string;
  email: string;
  faq: { q: string; a: string }[];
}

const ContentSchema = new Schema<IContentDocument>(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    tagline: { type: String, required: true },
    sub: { type: String, required: true },
    tentang: { type: String, required: true },
    wa: { type: String, required: true },
    aboutTitle: { type: String, required: true },
    about: { type: String, required: true },
    visi: { type: String, required: true },
    misi: { type: String, required: true },
    email: { type: String, required: true },
    faq: [{ q: { type: String }, a: { type: String } }],
  },
  { timestamps: true }
);

export const ContentModel: Model<IContentDocument> =
  mongoose.models.Content ||
  mongoose.model<IContentDocument>("Content", ContentSchema);
