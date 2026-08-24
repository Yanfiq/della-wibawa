import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { BusinessProfileModel } from "@/models/BusinessProfile";
import { CategoryModel } from "@/models/Category";
import { SettingsModel } from "@/models/Settings";
import { NotificationModel } from "@/models/Notification";
import { addDays, uid, fmtDate } from "@/lib/utils";
import { INCOME_CATS, EXPENSE_CATS, TRIAL_DAYS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { nama, email, password, namaUsaha, jenisUsaha } = await req.json();
    const cleanEmail = String(email || "").toLowerCase().trim();

    if (!cleanEmail || !password || !nama) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const userId = uid("usr");
    const trialStart = new Date().toISOString();
    const trialEnd = addDays(trialStart, TRIAL_DAYS).toISOString();

    const newUser = await UserModel.create({
      id: userId,
      nama,
      email: cleanEmail,
      password,
      role: "user",
      aktif: true,
      trialStart,
      trialEnd,
      namaUsaha,
      jenisUsaha,
      plan: "pkg_trial",
      subStatusManual: null,
      subStart: null,
      subEnd: null,
    });

    // Create default profile
    await BusinessProfileModel.create({
      userId,
      namaUsaha,
      jenisUsaha,
      pemilik: nama,
      email: cleanEmail,
      hp: "",
      alamat: "",
    });

    // Create default settings
    await SettingsModel.create({
      userId,
      reminderOn: true,
      reminderTime: "20:00",
      monthlyReportNotif: true,
    });

    // Create default categories
    const initialCats = [
      ...INCOME_CATS.map((n) => ({
        id: uid("cat"),
        userId,
        nama: n,
        jenis: "pemasukan" as const,
      })),
      ...EXPENSE_CATS.map((n) => ({
        id: uid("cat"),
        userId,
        nama: n,
        jenis: "pengeluaran" as const,
      })),
    ];
    await CategoryModel.insertMany(initialCats);

    // Initial notification
    await NotificationModel.create({
      id: uid("ntf"),
      userId,
      judul: "Trial 15 hari dimulai",
      isi: `Semua fitur terbuka sampai ${fmtDate(trialEnd.slice(0, 10))}.`,
      ts: Date.now(),
      read: false,
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat pendaftaran.";
    console.error("Register API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
