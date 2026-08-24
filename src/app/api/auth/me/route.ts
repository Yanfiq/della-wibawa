import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ id: userId });

    return NextResponse.json({ user: user || null });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data user.";
    console.error("Auth Me API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
