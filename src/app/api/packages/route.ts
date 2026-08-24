import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SubscriptionPackageModel } from "@/models/SubscriptionPackage";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { uid } from "@/lib/utils";

export async function GET() {
  try {
    await connectToDatabase();

    let packages = await SubscriptionPackageModel.find();
    if (!packages || packages.length === 0) {
      packages = await SubscriptionPackageModel.insertMany(DEFAULT_PACKAGES);
    }

    return NextResponse.json({ packages });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data paket.";
    console.error("GET Packages error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    if (body.id) {
      const updated = await SubscriptionPackageModel.findOneAndUpdate(
        { id: body.id },
        { $set: body },
        { new: true }
      );
      return NextResponse.json({ package: updated });
    } else {
      const created = await SubscriptionPackageModel.create({
        id: uid("pkg"),
        ...body,
      });
      return NextResponse.json({ package: created }, { status: 201 });
    }
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menyimpan paket.";
    console.error("POST Package error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
