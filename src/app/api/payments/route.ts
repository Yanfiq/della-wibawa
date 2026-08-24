import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentRequestModel } from "@/models/PaymentRequest";
import { NotificationModel } from "@/models/Notification";
import { SubscriptionPackageModel } from "@/models/SubscriptionPackage";
import { UserModel } from "@/models/User";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { uid, addDays, fmtDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    await connectToDatabase();

    const query = userId ? { userId } : {};
    const payments = await PaymentRequestModel.find(query).sort({
      submittedAt: -1,
    });
    return NextResponse.json({ payments });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengambil data pembayaran.";
    console.error("GET Payments error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, packageId, amount, method, proof, action, id, adminNote } = body;

    await connectToDatabase();

    // Cancel Subscription Action
    if (action === "cancel" && userId) {
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        user.subStatusManual = null;
        user.subEnd = null;
        user.subStart = null;
        user.plan = "pkg_trial";
        await user.save();
      }
      return NextResponse.json({ success: true });
    }

    // Approve Action
    if (action === "approve" && id) {
      const reqDoc = await PaymentRequestModel.findOne({ id });
      if (!reqDoc) return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });

      reqDoc.status = "approved";
      reqDoc.verifiedAt = new Date().toISOString();
      reqDoc.adminNote = "";
      await reqDoc.save();

      const user = await UserModel.findOne({ id: reqDoc.userId });
      const pkg = await SubscriptionPackageModel.findOne({ id: reqDoc.packageId });

      if (user) {
        const start = new Date();
        const end =
          pkg && pkg.satuan === "bulan"
            ? addDays(start, pkg.durasi * 30)
            : addDays(start, pkg ? pkg.durasi : 180);

        user.plan = reqDoc.packageId;
        user.subStatusManual = "active";
        user.subStart = start.toISOString();
        user.subEnd = end.toISOString();
        await user.save();

        await NotificationModel.create({
          id: uid("ntf"),
          userId: user.id,
          judul: "Langganan aktif",
          isi: `${pkg ? pkg.nama : "Langganan"} aktif sampai ${fmtDate(
            end.toISOString().slice(0, 10)
          )}.`,
          ts: Date.now(),
          read: false,
        });
      }

      return NextResponse.json({ payment: reqDoc });
    }

    // Reject Action
    if (action === "reject" && id) {
      const reqDoc = await PaymentRequestModel.findOne({ id });
      if (!reqDoc) return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });

      reqDoc.status = "rejected";
      reqDoc.adminNote = adminNote || "";
      reqDoc.verifiedAt = new Date().toISOString();
      await reqDoc.save();

      await NotificationModel.create({
        id: uid("ntf"),
        userId: reqDoc.userId,
        judul: "Pengajuan pembayaran ditolak",
        isi: adminNote || "Bukti pembayaran tidak sesuai.",
        ts: Date.now(),
        read: false,
      });

      return NextResponse.json({ payment: reqDoc });
    }

    // Submit new payment request
    let proofUrl = proof;
    if (proof && proof.startsWith("data:image")) {
      proofUrl = await uploadImageToCloudinary(proof, "smarta-umkm/payments");
    }

    const pkg = await SubscriptionPackageModel.findOne({ id: packageId });

    const newReq = await PaymentRequestModel.create({
      id: uid("pay"),
      userId,
      packageId,
      amount,
      method: method || "Pembayaran Manual / Demo",
      proof: proofUrl,
      submittedAt: new Date().toISOString(),
      status: "pending",
      adminNote: "",
      verifiedAt: null,
    });

    await NotificationModel.create({
      id: uid("ntf"),
      userId,
      judul: "Konfirmasi pembayaran terkirim",
      isi: `Pengajuan ${pkg ? pkg.nama : "Paket"} sedang menunggu verifikasi admin.`,
      ts: Date.now(),
      read: false,
    });

    return NextResponse.json({ payment: newReq }, { status: 201 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memproses pembayaran.";
    console.error("POST Payment error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
