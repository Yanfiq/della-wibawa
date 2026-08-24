import { AppContent, FAQItem } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/constants";

export const contentService = {
  async get(): Promise<AppContent> {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        if (data.content) return data.content;
      }
    } catch {
      // Return static default if fetch fails
    }
    return DEFAULT_CONTENT;
  },

  async update(patch: Partial<AppContent>): Promise<AppContent> {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal memperbarui konten.");
    }
    return data.content;
  },

  async reset(): Promise<AppContent> {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengembalikan konten ke default.");
    }
    return data.content;
  },

  async saveFaq(index: number, faq: FAQItem): Promise<FAQItem[]> {
    const cur = await this.get();
    const faqs = Array.isArray(cur.faq) ? [...cur.faq] : [];
    if (index >= 0 && index < faqs.length) {
      faqs[index] = faq;
    } else {
      faqs.push(faq);
    }
    await this.update({ faq: faqs });
    return faqs;
  },

  async deleteFaq(index: number): Promise<FAQItem[]> {
    const cur = await this.get();
    const faqs = Array.isArray(cur.faq) ? [...cur.faq] : [];
    faqs.splice(index, 1);
    await this.update({ faq: faqs });
    return faqs;
  },
};
