import { PaymentRequest } from "@/types";

export const paymentService = {
  async listAll(): Promise<PaymentRequest[]> {
    const res = await fetch("/api/payments");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data permohonan pembayaran.");
    }
    return data.payments || [];
  },

  async listByUser(userId: string): Promise<PaymentRequest[]> {
    const res = await fetch(`/api/payments?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data pembayaran.");
    }
    return data.payments || [];
  },

  async getLatestByUser(userId: string): Promise<PaymentRequest | null> {
    try {
      const list = await this.listByUser(userId);
      return list[0] || null;
    } catch {
      return null;
    }
  },

  async submitRequest(params: {
    userId: string;
    packageId: string;
    amount: number;
    method?: string;
    proof: string;
  }): Promise<PaymentRequest> {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengirim konfirmasi pembayaran.");
    }
    return data.payment;
  },

  async approve(id: string): Promise<PaymentRequest> {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", id }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menyetujui pembayaran.");
    }
    return data.payment;
  },

  async reject(id: string, adminNote: string): Promise<PaymentRequest> {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", id, adminNote }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menolak pembayaran.");
    }
    return data.payment;
  },

  async cancelSubscription(userId: string): Promise<void> {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", userId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal membatalkan langganan.");
    }
  },
};
