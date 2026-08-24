import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId, oldPassword, newPassword } = await req.json();

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan baru wajib diisi." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ id: userId });
    if (!user || user.password !== oldPassword) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai." },
        { status: 400 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengubah password.";
    console.error("Change Password API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
