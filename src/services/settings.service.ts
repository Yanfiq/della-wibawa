import {
  BusinessProfile,
  UserSettings,
  Category,
  TransactionType,
  User,
} from "@/types";

export const settingsService = {
  async getProfile(userId: string): Promise<BusinessProfile | null> {
    const res = await fetch(`/api/settings/profile?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil profil usaha.");
    }
    return data.profile || null;
  },

  async updateProfile(
    userId: string,
    profile: Partial<BusinessProfile>
  ): Promise<BusinessProfile> {
    const res = await fetch("/api/settings/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...profile }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal memperbarui profil usaha.");
    }
    return data.profile;
  },

  async getSettings(userId: string): Promise<UserSettings> {
    const res = await fetch(`/api/settings/preferences?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil pengaturan pengguna.");
    }
    return data.settings || {
      reminderOn: true,
      reminderTime: "20:00",
      monthlyReportNotif: true,
    };
  },

  async updateSettings(
    userId: string,
    patch: Partial<UserSettings>
  ): Promise<UserSettings> {
    const res = await fetch("/api/settings/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal memperbarui pengaturan.");
    }
    return data.settings;
  },

  async getCategories(userId: string): Promise<Category[]> {
    const res = await fetch(`/api/settings/categories?userId=${userId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil daftar kategori.");
    }
    return data.categories || [];
  },

  async saveCategory(
    userId: string,
    id: string | null,
    nama: string,
    jenis: TransactionType
  ): Promise<Category> {
    const res = await fetch("/api/settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, id, nama, jenis }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menyimpan kategori.");
    }
    return data.category;
  },

  async deleteCategory(userId: string, catId: string): Promise<void> {
    const res = await fetch("/api/settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, id: catId, action: "delete" }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menghapus kategori.");
    }
  },

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<void> {
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        oldPassword: oldPass,
        newPassword: newPass,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Password lama tidak sesuai.");
    }
  },

  async listAllUsers(): Promise<User[]> {
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data pengguna.");
    }
    return data.users || [];
  },

  async adminUpdateUserStatus(
    userId: string,
    status: "trial" | "active" | "expired",
    planId?: string
  ): Promise<User> {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action: "update-status",
        status,
        planId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal memperbarui status pengguna.");
    }
    return data.user;
  },

  async adminDeleteUser(userId: string): Promise<void> {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "delete" }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal menghapus pengguna.");
    }
  },
};
