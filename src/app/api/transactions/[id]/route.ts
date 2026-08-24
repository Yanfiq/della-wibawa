import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TransactionModel } from "@/models/Transaction";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    if (body.bukti && body.bukti.startsWith("data:image")) {
      body.bukti = await uploadImageToCloudinary(body.bukti, "smarta-umkm/receipts");
    }

    const updated = await TransactionModel.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction: updated });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memperbarui transaksi.";
    console.error("PUT Transaction error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    await TransactionModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menghapus transaksi.";
    console.error("DELETE Transaction error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
