import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = String(email || "").toLowerCase().trim();

    await connectToDatabase();

    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (user.aktif === false) {
      return NextResponse.json(
        { error: "Akun Anda dinonaktifkan. Hubungi admin." },
        { status: 403 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Gagal terhubung ke database server.";
    console.error("Login API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
