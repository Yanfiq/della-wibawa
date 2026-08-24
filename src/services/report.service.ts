import { ReportItem } from "@/types";
import { profitLoss } from "@/lib/utils";
import { transactionService } from "./transaction.service";

export const reportService = {
  async listArchived(userId?: string): Promise<ReportItem[]> {
    const url = userId ? `/api/reports?userId=${userId}` : "/api/reports";
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data laporan terarsip.");
    }
    return data.reports || [];
  },

  async isArchived(userId: string, periode: string): Promise<boolean> {
    try {
      const list = await this.listArchived(userId);
      return list.some((r) => r.periode === periode);
    } catch {
      return false;
    }
  },

  async archive(userId: string, periode: string): Promise<ReportItem> {
    const userTxs = await transactionService.listByUser(userId);
    const pl = profitLoss(userTxs, periode);

    const payload = {
      userId,
      periode,
      pendapatan: pl.totalPendapatan,
      beban: pl.totalBeban,
      laba: pl.laba,
      margin: pl.margin,
    };

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengarsipkan laporan.");
    }
    return data.report;
  },

  async deleteArchived(id: string): Promise<void> {
    const res = await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menghapus arsip laporan.");
    }
  },
};
