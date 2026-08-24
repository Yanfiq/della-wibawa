import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { NotificationModel } from "@/models/Notification";
import { uid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    const notifications = await NotificationModel.find({ userId }).sort({
      ts: -1,
    });
    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil notifikasi.";
    console.error("GET Notifications error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, notification } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    if (action === "read-all") {
      await NotificationModel.updateMany({ userId }, { $set: { read: true } });
      return NextResponse.json({ success: true });
    }

    if (action === "clear") {
      await NotificationModel.deleteMany({ userId });
      return NextResponse.json({ success: true });
    }

    if (action === "push" && notification) {
      if (notification.tag) {
        const exists = await NotificationModel.findOne({
          userId,
          tag: notification.tag,
        });
        if (exists) return NextResponse.json({ notification: exists });
      }

      const newNotif = await NotificationModel.create({
        id: uid("ntf"),
        userId,
        tag: notification.tag,
        judul: notification.judul,
        isi: notification.isi,
        ts: Date.now(),
        read: false,
      });

      return NextResponse.json({ notification: newNotif }, { status: 201 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memperbarui notifikasi.";
    console.error("POST Notifications error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
