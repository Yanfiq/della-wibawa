import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { TransactionModel } from "@/models/Transaction";
import { ReportModel } from "@/models/Report";
import { CategoryModel } from "@/models/Category";
import { SettingsModel } from "@/models/Settings";
import { NotificationModel } from "@/models/Notification";
import { BusinessProfileModel } from "@/models/BusinessProfile";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await UserModel.find({ role: { $ne: "admin" } }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ users });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data pengguna.";
    console.error("GET Admin Users error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, status, planId } = body;

    await connectToDatabase();

    if (action === "delete" && userId) {
      await Promise.all([
        UserModel.findOneAndDelete({ id: userId }),
        TransactionModel.deleteMany({ userId }),
        ReportModel.deleteMany({ userId }),
        CategoryModel.deleteMany({ userId }),
        SettingsModel.deleteMany({ userId }),
        NotificationModel.deleteMany({ userId }),
        BusinessProfileModel.deleteMany({ userId }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === "update-status" && userId) {
      const user = await UserModel.findOne({ id: userId });
      if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });

      user.plan = planId || user.plan;
      if (status === "active") {
        user.subStatusManual = "active";
        const d = new Date();
        d.setDate(d.getDate() + 180);
        user.subEnd = d.toISOString();
      } else if (status === "expired") {
        user.subStatusManual = "expired";
        user.subEnd = null;
      } else {
        user.subStatusManual = null;
        user.subEnd = null;
        const d = new Date();
        d.setDate(d.getDate() + 15);
        user.trialEnd = d.toISOString();
      }

      await user.save();
      return NextResponse.json({ user });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memproses aksi pengguna.";
    console.error("POST Admin User error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
