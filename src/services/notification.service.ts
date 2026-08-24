import { AppNotification } from "@/types";
import { todayISO } from "@/lib/utils";
import { authService } from "./auth.service";
import { settingsService } from "./settings.service";

export const notificationService = {
  async listByUser(userId: string): Promise<AppNotification[]> {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data notifikasi.");
    }
    return data.notifications || [];
  },

  async list(userId: string): Promise<AppNotification[]> {
    return this.listByUser(userId);
  },

  async markAllRead(userId: string): Promise<void> {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "read-all" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menandai notifikasi dibaca.");
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    return this.markAllRead(userId);
  },

  async clearAll(userId: string): Promise<void> {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "clear" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menghapus notifikasi.");
    }
  },

  async push(
    userId: string,
    notification: Omit<AppNotification, "id" | "ts" | "read">
  ): Promise<AppNotification | null> {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "push", notification }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.notification) return data.notification;
    } catch {
      // ignore
    }
    return null;
  },

  async pushReminders(userId: string): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user || user.id !== userId) return;

      const st = authService.getSubscriptionStatus(user);
      const trialDays = authService.getTrialDaysLeft(user);
      const today = todayISO();

      // 1. Daily reminder to record transactions
      const stg = await settingsService.getSettings(userId).catch(() => null);
      if (stg?.reminderOn) {
        const tag = `daily_${today}`;
        await this.push(userId, {
          tag,
          judul: "Pengingat Harian",
          isi: "Jangan lupa mencatat transaksi usaha Anda hari ini agar laporan tetap akurat.",
        });
      }

      // 2. Trial warning
      if (st === "trial" && trialDays <= 3 && trialDays > 0) {
        const tag = `trial_warn_${today}`;
        await this.push(userId, {
          tag,
          judul: "Masa Trial Segera Berakhir",
          isi: `Masa trial Anda tersisa ${trialDays} hari lagi. Pilih paket langganan untuk melanjutkan.`,
        });
      }

      // 3. Trial expired warning
      if (st === "expired") {
        const tag = `trial_exp_${today}`;
        await this.push(userId, {
          tag,
          judul: "Masa Trial Berakhir",
          isi: "Masa trial Anda telah habis. Silakan berlangganan untuk membuka kembali fitur pencatatan.",
        });
      }
    } catch {
      // ignore
    }
  },
};
