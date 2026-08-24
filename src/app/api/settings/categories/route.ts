import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CategoryModel } from "@/models/Category";
import { TransactionModel } from "@/models/Transaction";
import { INCOME_CATS, EXPENSE_CATS } from "@/lib/constants";
import { uid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    let categories = await CategoryModel.find({ userId });
    if (!categories || categories.length === 0) {
      const initial = [
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
      categories = await CategoryModel.insertMany(initial);
    }

    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data kategori.";
    console.error("GET Categories error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, id, nama, jenis, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    if (action === "delete" && id) {
      const cat = await CategoryModel.findOne({ id, userId });
      if (cat) {
        await TransactionModel.updateMany(
          { userId, kategori: cat.nama },
          { $set: { kategori: "Lainnya" } }
        );
        await CategoryModel.findOneAndDelete({ id, userId });
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      const cat = await CategoryModel.findOne({ id, userId });
      if (!cat) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

      const oldName = cat.nama;
      cat.nama = nama;
      await cat.save();

      await TransactionModel.updateMany(
        { userId, kategori: oldName },
        { $set: { kategori: nama } }
      );

      return NextResponse.json({ category: cat });
    } else {
      const created = await CategoryModel.create({
        id: uid("cat"),
        userId,
        nama,
        jenis,
      });
      return NextResponse.json({ category: created }, { status: 201 });
    }
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menyimpan kategori.";
    console.error("POST Category error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
