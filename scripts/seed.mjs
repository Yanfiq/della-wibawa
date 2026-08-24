import mongoose from "mongoose";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv(resolve(__dirname, "../.env.local"));
loadEnv(resolve(__dirname, "../.env"));

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local or .env");
  process.exit(1);
}

// Minimal schemas for seeding
const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    aktif: { type: Boolean, default: true },
    trialStart: { type: String, required: true },
    trialEnd: { type: String, required: true },
    namaUsaha: { type: String, default: "" },
    jenisUsaha: { type: String, default: "" },
    plan: { type: String, default: "pkg_trial" },
    subStatusManual: { type: String, default: null },
    subStart: { type: String, default: null },
    subEnd: { type: String, default: null },
  },
  { timestamps: true }
);

const BusinessProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    namaUsaha: { type: String, default: "" },
    jenisUsaha: { type: String, default: "" },
    pemilik: { type: String, default: "" },
    email: { type: String, default: "" },
    hp: { type: String, default: "" },
    alamat: { type: String, default: "" },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    nama: { type: String, required: true },
    jenis: { type: String, enum: ["pemasukan", "pengeluaran"], required: true },
  },
  { timestamps: true }
);

const TransactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    tanggal: { type: String, required: true, index: true },
    jenis: { type: String, enum: ["pemasukan", "pengeluaran"], required: true },
    kategori: { type: String, required: true },
    nominal: { type: Number, required: true },
    akunKeuangan: { type: String, enum: ["usaha", "pribadi"], default: "usaha", index: true },
    deskripsi: { type: String, default: "" },
    bukti: { type: String, default: null },
  },
  { timestamps: true }
);

const SubscriptionPackageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    nama: { type: String, required: true },
    harga: { type: Number, required: true },
    durasi: { type: Number, required: true },
    satuan: { type: String, enum: ["hari", "bulan"], default: "bulan" },
    batas: { type: Number, default: 0 },
    fitur: { type: [String], default: [] },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    tagline: { type: String, required: true },
    sub: { type: String, required: true },
    tentang: { type: String, required: true },
    wa: { type: String, required: true },
    aboutTitle: { type: String, required: true },
    about: { type: String, required: true },
    visi: { type: String, required: true },
    misi: { type: String, required: true },
    email: { type: String, required: true },
    faq: [{ q: { type: String }, a: { type: String } }],
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    reminderOn: { type: Boolean, default: true },
    reminderTime: { type: String, default: "20:00" },
    monthlyReportNotif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const BusinessProfileModel = mongoose.models.BusinessProfile || mongoose.model("BusinessProfile", BusinessProfileSchema);
const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
const SubscriptionPackageModel = mongoose.models.SubscriptionPackage || mongoose.model("SubscriptionPackage", SubscriptionPackageSchema);
const ContentModel = mongoose.models.Content || mongoose.model("Content", ContentSchema);
const SettingsModel = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

const DEFAULT_PACKAGES = [
  {
    id: "pkg_trial",
    nama: "Uji Coba Gratis",
    harga: 0,
    durasi: 15,
    satuan: "hari",
    batas: 100,
    fitur: [
      "Pencatatan pemasukan & pengeluaran",
      "Pemisahan keuangan usaha vs pribadi",
      "Laporan laba rugi otomatis",
      "Maksimal 100 transaksi",
      "Berlaku 15 hari pertama",
    ],
    aktif: true,
  },
  {
    id: "pkg_6bulan",
    nama: "Langganan 6 Bulan",
    harga: 150000,
    durasi: 6,
    satuan: "bulan",
    batas: 0,
    fitur: [
      "Transaksi tanpa batas",
      "Laporan laba rugi, bulanan & tahunan",
      "Arsip keuangan lengkap",
      "Pemisahan keuangan usaha & pribadi",
      "Export laporan & cetak PDF",
      "Dukungan bantuan prioritas",
    ],
    aktif: true,
  },
];

const DEFAULT_CONTENT = {
  tagline: "Catat Keuangan, Tingkatkan Keuntungan UMKM Anda",
  sub: "Aplikasi pencatatan keuangan sederhana, praktis, dan otomatis menghitung laba rugi untuk UMKM.",
  tentang:
    "SMARTA UMKM hadir untuk membantu pelaku UMKM mengelola keuangan dengan rapi, memisahkan uang usaha dan pribadi, serta mengetahui kondisi keuntungan usaha secara real-time.",
  wa: "0812-3456-7890",
  aboutTitle: "Tentang SMARTA UMKM",
  about:
    "SMARTA UMKM dirancang untuk membantu pemilik UMKM mengelola pencatatan keuangan secara rapi, memisahkan keuangan pribadi dari usaha, serta menyajikan laporan laba rugi yang mudah dipahami.",
  visi: "Menjadi mitra digital utama UMKM Indonesia dalam mencapai kesehatan keuangan dan pertumbuhan bisnis yang berkelanjutan.",
  misi: "Menyediakan aplikasi pencatatan keuangan yang sederhana, akurat, dan dapat diakses dengan mudah oleh seluruh pelaku usaha mikro, kecil, dan menengah.",
  email: "smartaumkm@gmail.com",
  faq: [
    {
      q: "Apa itu SMARTA UMKM?",
      a: "SMARTA UMKM adalah platform web pencatatan keuangan yang dirancang khusus bagi pelaku UMKM agar mudah memisahkan keuangan usaha dan pribadi serta melihat laporan laba rugi otomatis.",
    },
    {
      q: "Berapa lama masa uji coba gratis?",
      a: "Anda mendapatkan masa uji coba gratis selama 15 hari dengan batas 100 transaksi untuk mencoba seluruh fitur utama.",
    },
    {
      q: "Bagaimana cara berlangganan setelah masa uji coba?",
      a: "Buka menu Paket Langganan, pilih paket 6 bulan, lalu ikuti petunjuk konfirmasi transfer manual/demo yang tersedia.",
    },
  ],
};

const INCOME_CATS = ["Penjualan Produk", "Pendapatan Jasa", "Pendapatan Lain-lain"];
const EXPENSE_CATS = [
  "Bahan Baku",
  "Operasional",
  "Gaji Karyawan",
  "Sewa Tempat",
  "Listrik & Air",
  "Transportasi",
  "Pemasaran",
  "Lain-lain",
];

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI.replace(/:[^:]*@/, ":****@"));
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(" Connected to MongoDB successfully!");

  // 1. Seed Packages
  for (const pkg of DEFAULT_PACKAGES) {
    await SubscriptionPackageModel.findOneAndUpdate(
      { id: pkg.id },
      { $set: pkg },
      { upsert: true, new: true }
    );
  }
  console.log(" Packages seeded.");

  // 2. Seed Content
  await ContentModel.findOneAndUpdate(
    { key: "main" },
    { $set: DEFAULT_CONTENT },
    { upsert: true, new: true }
  );
  console.log(" Landing Content seeded.");

  // 3. Seed Admin Account
  const adminId = "usr_admin";
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 5);

  const admin = await UserModel.findOneAndUpdate(
    { email: "admin@smartaumkm.id" },
    {
      $set: {
        id: adminId,
        nama: "Administrator",
        email: "admin@smartaumkm.id",
        password: "admin123",
        role: "admin",
        aktif: true,
        trialStart: now.toISOString(),
        trialEnd: nextYear.toISOString(),
        namaUsaha: "SMARTA UMKM Management",
        jenisUsaha: "Administrator",
        plan: "pkg_6bulan",
        subStatusManual: "active",
        subStart: now.toISOString(),
        subEnd: nextYear.toISOString(),
      },
    },
    { upsert: true, new: true }
  );
  console.log(" Admin account ready:", admin.email, "(password: admin123)");

  // 4. Seed Demo User Account
  const demoUserId = "usr_demo_umkm";
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 15);

  const demoUser = await UserModel.findOneAndUpdate(
    { email: "demo@smartaumkm.id" },
    {
      $set: {
        id: demoUserId,
        nama: "Budi Santoso",
        email: "demo@smartaumkm.id",
        password: "demo123",
        role: "user",
        aktif: true,
        trialStart: now.toISOString(),
        trialEnd: trialEnd.toISOString(),
        namaUsaha: "Warung Berkah Budi",
        jenisUsaha: "Usaha Dagang",
        plan: "pkg_trial",
        subStatusManual: null,
        subStart: null,
        subEnd: null,
      },
    },
    { upsert: true, new: true }
  );
  console.log(" Demo user account ready:", demoUser.email, "(password: demo123)");

  // Business Profile for Demo User
  await BusinessProfileModel.findOneAndUpdate(
    { userId: demoUserId },
    {
      $set: {
        userId: demoUserId,
        namaUsaha: "Warung Berkah Budi",
        jenisUsaha: "Usaha Dagang",
        pemilik: "Budi Santoso",
        email: "demo@smartaumkm.id",
        hp: "0812-3456-7890",
        alamat: "Jl. Slamet Riyadi No. 123, Surakarta",
      },
    },
    { upsert: true, new: true }
  );

  // Settings for Demo User
  await SettingsModel.findOneAndUpdate(
    { userId: demoUserId },
    {
      $set: {
        userId: demoUserId,
        reminderOn: true,
        reminderTime: "20:00",
        monthlyReportNotif: true,
      },
    },
    { upsert: true, new: true }
  );

  // Categories for Demo User
  for (const n of INCOME_CATS) {
    await CategoryModel.findOneAndUpdate(
      { userId: demoUserId, nama: n },
      { $set: { id: `cat_${n.replace(/\s+/g, "_").toLowerCase()}`, userId: demoUserId, nama: n, jenis: "pemasukan" } },
      { upsert: true }
    );
  }
  for (const n of EXPENSE_CATS) {
    await CategoryModel.findOneAndUpdate(
      { userId: demoUserId, nama: n },
      { $set: { id: `cat_${n.replace(/\s+/g, "_").toLowerCase()}`, userId: demoUserId, nama: n, jenis: "pengeluaran" } },
      { upsert: true }
    );
  }
  console.log(" Demo user profile, settings & categories seeded.");

  // Sample transactions for Demo User if empty
  const txCount = await TransactionModel.countDocuments({ userId: demoUserId });
  if (txCount === 0) {
    const today = new Date().toISOString().slice(0, 10);
    const sampleTxs = [
      {
        id: "trx_demo_1",
        userId: demoUserId,
        tanggal: today,
        jenis: "pemasukan",
        kategori: "Penjualan Produk",
        nominal: 850000,
        akunKeuangan: "usaha",
        deskripsi: "Penjualan paket sembako harian",
        bukti: null,
      },
      {
        id: "trx_demo_2",
        userId: demoUserId,
        tanggal: today,
        jenis: "pengeluaran",
        kategori: "Bahan Baku",
        nominal: 320000,
        akunKeuangan: "usaha",
        deskripsi: "Kulakan beras dan minyak goreng",
        bukti: null,
      },
      {
        id: "trx_demo_3",
        userId: demoUserId,
        tanggal: today,
        jenis: "pengeluaran",
        kategori: "Operasional",
        nominal: 45000,
        akunKeuangan: "usaha",
        deskripsi: "Plastik kresek dan kemasan",
        bukti: null,
      },
      {
        id: "trx_demo_4",
        userId: demoUserId,
        tanggal: today,
        jenis: "pengeluaran",
        kategori: "Lain-lain",
        nominal: 75000,
        akunKeuangan: "pribadi",
        deskripsi: "Makan siang keluarga (Pribadi)",
        bukti: null,
      },
    ];
    await TransactionModel.insertMany(sampleTxs);
    console.log(" Initial sample transactions seeded for demo user.");
  }

  console.log("\n MongoDB Seeding complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
