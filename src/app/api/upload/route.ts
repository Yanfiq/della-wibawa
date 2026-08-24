import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { image, folder } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    const secureUrl = await uploadImageToCloudinary(
      image,
      folder || "smarta-umkm/receipts"
    );

    return NextResponse.json({ url: secureUrl });
  } catch (error) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar ke Cloudinary." },
      { status: 500 }
    );
  }
}
