import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { BusinessProfileModel } from "@/models/BusinessProfile";
import { UserModel } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    let profile = await BusinessProfileModel.findOne({ userId });
    if (!profile) {
      const user = await UserModel.findOne({ id: userId });
      profile = await BusinessProfileModel.create({
        userId,
        namaUsaha: user?.namaUsaha || "",
        jenisUsaha: user?.jenisUsaha || "",
        pemilik: user?.nama || "",
        email: user?.email || "",
        hp: "",
        alamat: "",
      });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil profil usaha.";
    console.error("GET Profile error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, namaUsaha, jenisUsaha, pemilik, email, hp, alamat } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await BusinessProfileModel.findOneAndUpdate(
      { userId },
      { $set: { namaUsaha, jenisUsaha, pemilik, email, hp, alamat } },
      { new: true, upsert: true }
    );

    // Sync to user record
    await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: { namaUsaha, jenisUsaha, nama: pemilik } }
    );

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memperbarui profil usaha.";
    console.error("POST Profile error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
