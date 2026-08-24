import { User, SubscriptionStatus } from "@/types";
import { daysBetween } from "@/lib/utils";

const SESSION_KEY = "smarta_user_session";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw) as User;
      if (!cached?.id) return null;

      // Revalidate from database
      const res = await fetch(`/api/auth/me?userId=${cached.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
      return cached;
    } catch {
      return null;
    }
  },

  async login(email: string, pass: string): Promise<User> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal masuk. Periksa kembali email dan password Anda.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  async loginDemo(): Promise<User> {
    return this.login("demo@smartaumkm.id", "demo123");
  },

  async register(params: {
    nama: string;
    email: string;
    pass: string;
    namaUsaha: string;
    jenisUsaha: string;
  }): Promise<User> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: params.nama,
        email: params.email,
        password: params.pass,
        namaUsaha: params.namaUsaha,
        jenisUsaha: params.jenisUsaha,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Pendaftaran gagal.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getSubscriptionStatus(u: User | null): SubscriptionStatus {
    if (!u) return "expired";
    if (
      u.subStatusManual === "active" &&
      u.subEnd &&
      new Date(u.subEnd) > new Date()
    ) {
      return "active";
    }
    return daysBetween(new Date(), u.trialEnd) > 0 ? "trial" : "expired";
  },

  getTrialDaysLeft(u: User | null): number {
    return u ? Math.max(0, daysBetween(new Date(), u.trialEnd)) : 0;
  },
};
