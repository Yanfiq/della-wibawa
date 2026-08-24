import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ContentModel } from "@/models/Content";
import { DEFAULT_CONTENT } from "@/lib/constants";

export async function GET() {
  try {
    await connectToDatabase();

    let content = await ContentModel.findOne({ key: "main" });
    if (!content) {
      content = await ContentModel.create({
        key: "main",
        ...DEFAULT_CONTENT,
      });
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data konten.";
    console.error("GET Content error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    if (body.action === "reset") {
      const resetContent = await ContentModel.findOneAndUpdate(
        { key: "main" },
        { $set: DEFAULT_CONTENT },
        { new: true, upsert: true }
      );
      return NextResponse.json({ content: resetContent });
    }

    const updated = await ContentModel.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ content: updated });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memperbarui konten.";
    console.error("POST Content error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
