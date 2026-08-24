import { SubscriptionPackage } from "@/types";

export const packageService = {
  async listAll(): Promise<SubscriptionPackage[]> {
    const res = await fetch("/api/packages");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data paket.");
    }
    return data.packages || [];
  },

  async listActive(): Promise<SubscriptionPackage[]> {
    const list = await this.listAll();
    return list.filter((p) => p.aktif);
  },

  async getById(id: string): Promise<SubscriptionPackage | null> {
    const list = await this.listAll();
    return list.find((p) => p.id === id) || null;
  },

  async save(
    id: string | null,
    pkgData: Omit<SubscriptionPackage, "id">
  ): Promise<SubscriptionPackage> {
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...pkgData }),
    });

    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData.error || "Gagal menyimpan paket.");
    }
    return resData.package;
  },

  async toggleActive(id: string): Promise<SubscriptionPackage> {
    const p = await this.getById(id);
    if (!p) throw new Error("Paket tidak ditemukan.");
    return this.save(id, {
      nama: p.nama,
      harga: p.harga,
      durasi: p.durasi,
      satuan: p.satuan,
      batas: p.batas,
      fitur: p.fitur,
      aktif: !p.aktif,
    });
  },
};
