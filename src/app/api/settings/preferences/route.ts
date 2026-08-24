import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SettingsModel } from "@/models/Settings";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    let settings = await SettingsModel.findOne({ userId });
    if (!settings) {
      settings = await SettingsModel.create({
        userId,
        reminderOn: true,
        reminderTime: "20:00",
        monthlyReportNotif: true,
      });
    }

    return NextResponse.json({ settings });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil pengaturan.";
    console.error("GET Settings error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...patch } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    const settings = await SettingsModel.findOneAndUpdate(
      { userId },
      { $set: patch },
      { new: true, upsert: true }
    );

    return NextResponse.json({ settings });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memperbarui pengaturan.";
    console.error("POST Settings error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
