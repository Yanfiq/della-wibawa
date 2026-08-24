import { Transaction, TransactionType, FinancialAccountType } from "@/types";

export const transactionService = {
  async listByUser(userId: string): Promise<Transaction[]> {
    const res = await fetch(`/api/transactions?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data transaksi dari database.");
    }
    return data.transactions || [];
  },

  async getById(id: string): Promise<Transaction | null> {
    const res = await fetch(`/api/transactions/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data.transaction || null;
  },

  async create(data: {
    userId: string;
    tanggal: string;
    jenis: TransactionType;
    kategori: string;
    nominal: number;
    akunKeuangan: FinancialAccountType;
    deskripsi?: string;
    bukti?: string | null;
  }): Promise<Transaction> {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData.error || "Gagal menyimpan transaksi ke database.");
    }
    return resData.transaction;
  },

  async update(
    id: string,
    patch: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>
  ): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData.error || "Gagal memperbarui transaksi.");
    }
    return resData.transaction;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData.error || "Gagal menghapus transaksi.");
    }
  },
};
