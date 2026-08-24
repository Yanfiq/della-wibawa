import { AppContent, FAQItem, SubscriptionPackage } from "@/types";

export const DB_KEY = "smarta_v1";
export const TRIAL_DAYS = 15;

export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const INCOME_CATS = [
  "Penjualan Produk",
  "Penjualan Jasa",
  "Pendapatan Lainnya",
  "Modal",
  "Lainnya",
];

export const EXPENSE_CATS = [
  "Pembelian Barang",
  "Bahan Baku",
  "Gaji Karyawan",
  "Sewa Tempat",
  "Listrik & Air",
  "Transportasi",
  "Operasional",
  "Lainnya",
];

export const DEFAULT_FAQ: FAQItem[] = [
  {
    q: "Bagaimana cara membuat akun?",
    a: "Klik Daftar Gratis, isi nama, email, password, nama usaha, dan jenis usaha. Akun baru mendapatkan trial selama 15 hari.",
  },
  {
    q: "Bagaimana cara mencatat transaksi?",
    a: "Masuk ke dashboard, pilih Tambah Transaksi, pilih pemasukan atau pengeluaran, isi tanggal, nominal, kategori, akun keuangan, lalu simpan transaksi.",
  },
  {
    q: "Bagaimana cara upload foto bukti transaksi?",
    a: "Pada form Tambah Transaksi, pilih Upload Bukti Transaksi kemudian pilih foto nota atau struk dari perangkat.",
  },
  {
    q: "Bagaimana cara mengambil foto dari kamera?",
    a: "Pilih Ambil Foto dari Kamera. Browser akan meminta izin untuk menggunakan kamera perangkat.",
  },
  {
    q: "Bagaimana cara memisahkan keuangan usaha dan pribadi?",
    a: "Setiap transaksi memiliki pilihan Keuangan Usaha atau Keuangan Pribadi. Transaksi pribadi tidak masuk ke dalam laporan laba rugi usaha.",
  },
  {
    q: "Bagaimana cara melihat laporan laba rugi?",
    a: "Buka menu Laporan Laba Rugi, pilih bulan dan tahun, kemudian sistem akan menghitung laporan berdasarkan transaksi keuangan usaha.",
  },
  {
    q: "Bagaimana cara download laporan?",
    a: "Buka Laporan Laba Rugi kemudian gunakan tombol Download PDF atau fitur cetak browser untuk menyimpan laporan sebagai PDF.",
  },
  {
    q: "Bagaimana cara kerja trial?",
    a: "Setiap akun baru mendapatkan akses trial selama 15 hari.",
  },
  {
    q: "Bagaimana cara berlangganan?",
    a: "Pilih Paket Langganan, pilih paket yang tersedia, kemudian ikuti proses konfirmasi pembayaran.",
  },
  {
    q: "Apakah SMARTA UMKM menggunakan payment gateway?",
    a: "Untuk versi saat ini, pembayaran online belum menggunakan payment gateway. Sistem menggunakan alur pembayaran manual/demo dan nantinya dapat diintegrasikan dengan payment gateway oleh developer.",
  },
];

export const DEFAULT_CONTENT: AppContent = {
  tagline: "Catat Keuangan, Tingkatkan Keuntungan",
  sub: "SMARTA UMKM membantu pemilik usaha dagang & jasa mencatat keuangan, memisahkan keuangan pribadi dari usaha, dan menganalisa laba rugi secara otomatis.",
  tentang:
    "SMARTA UMKM adalah platform pencatatan keuangan sederhana untuk UMKM Indonesia — pembukuan rapi, laporan otomatis, tanpa istilah akuntansi yang membingungkan.",
  wa: "0812-3456-7890",
  aboutTitle: "Tentang SMARTA UMKM",
  about:
    "SMARTA UMKM adalah platform pencatatan keuangan sederhana yang membantu UMKM mencatat transaksi, memisahkan keuangan usaha dan pribadi, serta memahami kondisi keuangan usaha.",
  visi: "Menjadi pendamping keuangan digital yang paling mudah digunakan oleh pelaku UMKM di Indonesia.",
  misi: "Menyediakan pembukuan sederhana, laporan laba rugi otomatis, dan edukasi keuangan yang membumi bagi usaha dagang dan jasa.",
  email: "smartaumkm@gmail.com",
  faq: DEFAULT_FAQ,
};

export const DEFAULT_PACKAGES: SubscriptionPackage[] = [
  {
    id: "pkg_trial",
    nama: "Uji Coba Gratis",
    harga: 0,
    durasi: 15,
    satuan: "hari",
    batas: 100,
    fitur: [
      "Semua fitur lengkap",
      "Hingga 100 transaksi",
      "1 akun usaha",
      "Laporan laba rugi",
    ],
    aktif: true,
  },
  {
    id: "pkg_6bulan",
    nama: "Langganan 6 Bulan",
    harga: 51000,
    durasi: 6,
    satuan: "bulan",
    batas: 0,
    fitur: [
      "Semua fitur lengkap",
      "Transaksi tidak terbatas",
      "Pisah keuangan pribadi & usaha",
      "Download laporan PDF",
      "Helpdesk email prioritas",
      "Chat bot 24 jam",
    ],
    aktif: true,
  },
];
