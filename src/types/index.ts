export type UserRole = "user" | "admin";
export type SubscriptionStatus = "trial" | "active" | "expired" | "pending" | "rejected";
export type FinancialAccountType = "usaha" | "pribadi";
export type TransactionType = "pemasukan" | "pengeluaran";
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
  aktif: boolean;
  trialStart: string;
  trialEnd: string;
  namaUsaha: string;
  jenisUsaha: string;
  plan: string;
  subStatusManual: string | null;
  subStart?: string | null;
  subEnd?: string | null;
}

export interface BusinessProfile {
  namaUsaha: string;
  jenisUsaha: string;
  pemilik: string;
  email: string;
  hp: string;
  alamat: string;
}

export interface Transaction {
  id: string;
  userId: string;
  tanggal: string; // YYYY-MM-DD
  jenis: TransactionType;
  kategori: string;
  nominal: number;
  akunKeuangan: FinancialAccountType;
  deskripsi: string;
  bukti: string | null; // base64 or URL
  createdAt: string;
}

export interface TransactionDTO {
  id: string;
  userId: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  financialType: "personal" | "business";
  description: string;
  proof: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  nama: string;
  jenis: TransactionType;
}

export interface ReportItem {
  id: string;
  userId: string;
  periode: string; // YYYY-MM
  pendapatan: number;
  beban: number;
  laba: number;
  margin: number;
  createdAt: string;
}

export interface SubscriptionPackage {
  id: string;
  nama: string;
  harga: number;
  durasi: number;
  satuan: "hari" | "bulan";
  batas: number; // 0 = unlimited
  fitur: string[];
  aktif: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  method: string;
  proof: string;
  submittedAt: string;
  status: PaymentStatus;
  adminNote?: string;
  verifiedAt?: string | null;
}

export interface AppNotification {
  id: string;
  tag?: string;
  judul: string;
  isi: string;
  ts: number;
  read: boolean;
}

export interface UserSettings {
  reminderOn: boolean;
  reminderTime: string;
  monthlyReportNotif: boolean;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface AppContent {
  tagline: string;
  sub: string;
  tentang: string;
  wa: string;
  aboutTitle: string;
  about: string;
  visi: string;
  misi: string;
  email: string;
  faq: FAQItem[];
}

export interface ProfitLossBreakdown {
  nama: string;
  nilai: number;
}

export interface ProfitLossResult {
  pendapatan: ProfitLossBreakdown[];
  beban: ProfitLossBreakdown[];
  totalPendapatan: number;
  totalBeban: number;
  laba: number;
  margin: number;
  jumlahTransaksi: number;
}

export interface InterpretationResult {
  judul: string;
  kalimat: string;
  poin: string[];
}

export interface MonthlySeriesItem {
  bulan: string;
  periode: string;
  masuk: number;
  keluar: number;
  laba: number;
  count: number;
}

export interface FilterState {
  q: string;
  jenis: string;
  kategori: string;
  akun: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  sort: string;
}

export type ActiveRoute =
  | "beranda"
  | "tambah"
  | "labarugi"
  | "usaha"
  | "pribadi"
  | "riwayat"
  | "kategori"
  | "bulanan"
  | "tahunan"
  | "arsip"
  | "paket"
  | "setelan"
  | "bantuanApp"
  | "admin"
  | "adminUsers"
  | "adminPaket"
  | "adminPembayaran"
  | "adminKonten";
