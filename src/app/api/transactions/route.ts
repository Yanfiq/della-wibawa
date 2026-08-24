import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TransactionModel } from "@/models/Transaction";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { uid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    await connectToDatabase();

    const transactions = await TransactionModel.find({ userId }).sort({
      tanggal: -1,
      createdAt: -1,
    });

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data transaksi.";
    console.error("GET Transactions error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      tanggal,
      jenis,
      kategori,
      nominal,
      akunKeuangan,
      deskripsi,
      bukti,
    } = body;

    if (!userId || !tanggal || !jenis || !nominal) {
      return NextResponse.json(
        { error: "Data transaksi tidak lengkap." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let proofUrl = bukti || null;
    if (bukti && bukti.startsWith("data:image")) {
      proofUrl = await uploadImageToCloudinary(bukti, "smarta-umkm/receipts");
    }

    const newTx = await TransactionModel.create({
      id: uid("trx"),
      userId,
      tanggal,
      jenis,
      kategori,
      nominal: Number(nominal),
      akunKeuangan: akunKeuangan || "usaha",
      deskripsi: deskripsi || kategori,
      bukti: proofUrl,
    });

    return NextResponse.json({ transaction: newTx }, { status: 201 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menyimpan transaksi.";
    console.error("POST Transaction error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
