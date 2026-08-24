import {
  Transaction,
  ProfitLossResult,
  InterpretationResult,
  MonthlySeriesItem,
  TransactionDTO,
  FinancialAccountType,
  TransactionType,
} from "@/types";
import { EXPENSE_CATS, INCOME_CATS, MONTHS } from "./constants";

export const uid = (prefix = "id"): string =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const esc = (s: string | null | undefined): string =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c] || c)
  );

export const rp = (n: number | string | null | undefined): string =>
  "Rp " + Math.round(Math.abs(Number(n) || 0)).toLocaleString("id-ID");

export const signed = (n: number, type: TransactionType): string =>
  (type === "pemasukan" ? "+" : "−") + rp(n);

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const addDays = (d: string | Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const daysBetween = (a: string | Date, b: string | Date): number =>
  Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${MONTHS[d.getMonth()]?.slice(0, 3)} ${d.getFullYear()}`;
};

export const fmtDateTime = (ts: number | string | null | undefined): string => {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const ym = (iso: string | null | undefined): string =>
  (iso || "").slice(0, 7);

export const isEmail = (v: string | null | undefined): boolean =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v || "").trim());

export const clamp = (v: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, v));

export function sumBy(
  list: Transaction[],
  jenis: TransactionType,
  akun?: FinancialAccountType
): number {
  return list
    .filter((t) => t.jenis === jenis && (!akun || t.akunKeuangan === akun))
    .reduce((s, t) => s + Number(t.nominal || 0), 0);
}

export function totals(
  list: Transaction[],
  akun?: FinancialAccountType
): { masuk: number; keluar: number; saldo: number; count: number } {
  const masuk = sumBy(list, "pemasukan", akun);
  const keluar = sumBy(list, "pengeluaran", akun);
  const count = list.filter((t) => !akun || t.akunKeuangan === akun).length;
  return { masuk, keluar, saldo: masuk - keluar, count };
}

/** Laba rugi USAHA saja — transaksi pribadi tidak pernah masuk. */
export function profitLoss(list: Transaction[], period?: string): ProfitLossResult {
  const rows = list.filter(
    (t) => t.akunKeuangan === "usaha" && (!period || ym(t.tanggal) === period)
  );

  const pick = (jenis: TransactionType, cats: string[]) =>
    cats.map((c) => ({
      nama: c,
      nilai: rows
        .filter((t) => t.jenis === jenis && t.kategori === c)
        .reduce((s, t) => s + Number(t.nominal || 0), 0),
    }));

  const pendapatan = pick("pemasukan", INCOME_CATS);
  const beban = pick("pengeluaran", EXPENSE_CATS);
  const totalPendapatan = pendapatan.reduce((s, r) => s + r.nilai, 0);
  const totalBeban = beban.reduce((s, r) => s + r.nilai, 0);
  const laba = totalPendapatan - totalBeban;
  const margin = totalPendapatan > 0 ? (laba / totalPendapatan) * 100 : 0;

  return {
    pendapatan,
    beban,
    totalPendapatan,
    totalBeban,
    laba,
    margin,
    jumlahTransaksi: rows.length,
  };
}

export function interpret(
  pl: ProfitLossResult,
  prevPl?: ProfitLossResult
): InterpretationResult {
  let judul: string;
  let kalimat: string;

  if (pl.totalPendapatan === 0 && pl.totalBeban === 0) {
    judul = "Belum Ada Data";
    kalimat =
      "Belum ada transaksi usaha pada periode ini, sehingga laba rugi belum dapat dianalisa.";
  } else if (pl.laba > 0 && pl.margin >= 15) {
    judul = "Keuangan Sehat";
    kalimat = "Usaha menunjukkan kondisi keuangan yang sehat.";
  } else if (pl.laba > 0) {
    judul = "Perlu Perhatian";
    kalimat = "Usaha masih menghasilkan laba, tetapi margin perlu diperhatikan.";
  } else if (pl.laba === 0) {
    judul = "Kondisi Impas";
    kalimat = "Usaha berada pada kondisi impas.";
  } else {
    judul = "Mengalami Kerugian";
    kalimat = "Usaha mengalami kerugian pada periode ini.";
  }

  const poin: string[] = [];
  if (prevPl && prevPl.totalPendapatan > 0) {
    const delta =
      ((pl.totalPendapatan - prevPl.totalPendapatan) / prevPl.totalPendapatan) * 100;
    poin.push(
      "Pendapatan " +
        (delta >= 0 ? "naik " : "turun ") +
        Math.abs(delta).toFixed(1) +
        "% dibanding periode sebelumnya."
    );
  } else if (pl.totalPendapatan > 0) {
    poin.push(
      "Belum ada pembanding periode sebelumnya, jadikan periode ini sebagai basis perbandingan."
    );
  }

  const terbesar = pl.beban.slice().sort((a, b) => b.nilai - a.nilai)[0];
  if (terbesar && terbesar.nilai > 0) {
    const pct =
      pl.totalPendapatan > 0
        ? ((terbesar.nilai / pl.totalPendapatan) * 100).toFixed(0)
        : "0";
    poin.push(
      "Beban terbesar: " +
        terbesar.nama +
        " " +
        rp(terbesar.nilai) +
        " (" +
        pct +
        "% dari pendapatan)."
    );
  }

  if (pl.totalPendapatan > 0)
    poin.push("Margin laba bersih " + pl.margin.toFixed(1) + "%.");

  if (pl.laba > 0) {
    poin.push(
      "Rekomendasi: sisihkan 10–15% laba (±" +
        rp(pl.laba * 0.12) +
        ") sebagai dana darurat usaha."
    );
  } else if (pl.laba < 0) {
    poin.push(
      "Rekomendasi: tekan beban terbesar dan tingkatkan penjualan produk/jasa dengan margin tertinggi."
    );
  } else {
    poin.push("Rekomendasi: tambah volume penjualan agar melewati titik impas.");
  }

  return { judul, kalimat, poin };
}

export function monthlySeries(
  list: Transaction[],
  year: string,
  akun?: FinancialAccountType
): MonthlySeriesItem[] {
  return MONTHS.map((m, i) => {
    const p = year + "-" + String(i + 1).padStart(2, "0");
    const rows = list.filter(
      (t) => ym(t.tanggal) === p && (!akun || t.akunKeuangan === akun)
    );
    const masuk = sumBy(rows, "pemasukan");
    const keluar = sumBy(rows, "pengeluaran");
    return {
      bulan: m,
      periode: p,
      masuk,
      keluar,
      laba: masuk - keluar,
      count: rows.length,
    };
  });
}

export function toTransactionDTO(t: Transaction): TransactionDTO {
  return {
    id: t.id,
    userId: t.userId,
    date: t.tanggal,
    type: t.jenis === "pemasukan" ? "income" : "expense",
    category: t.kategori,
    amount: Number(t.nominal || 0),
    financialType: t.akunKeuangan === "pribadi" ? "personal" : "business",
    description: t.deskripsi || "",
    proof: t.bukti || null,
    createdAt: t.createdAt,
  };
}

export function fromTransactionDTO(d: TransactionDTO): Transaction {
  return {
    id: d.id,
    userId: d.userId,
    tanggal: d.date,
    jenis: d.type === "income" ? "pemasukan" : "pengeluaran",
    kategori: d.category,
    nominal: Number(d.amount || 0),
    akunKeuangan: d.financialType === "personal" ? "pribadi" : "usaha",
    deskripsi: d.description || "",
    bukti: d.proof || null,
    createdAt: d.createdAt,
  };
}
