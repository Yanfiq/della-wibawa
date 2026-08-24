import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ReportModel } from "@/models/Report";
import { uid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    await connectToDatabase();

    const query = userId ? { userId } : {};
    const reports = await ReportModel.find(query).sort({ periode: -1 });
    return NextResponse.json({ reports });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data laporan.";
    console.error("GET Reports error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const report = await ReportModel.create({
      id: uid("rpt"),
      userId: body.userId,
      periode: body.periode,
      pendapatan: body.pendapatan,
      beban: body.beban,
      laba: body.laba,
      margin: body.margin,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengarsipkan laporan.";
    console.error("POST Report error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID laporan diperlukan." }, { status: 400 });
    }

    await connectToDatabase();
    await ReportModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menghapus arsip laporan.";
    console.error("DELETE Report error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
