"use client";

import React, { useEffect, useState } from "react";
import { contentService } from "@/services/content.service";
import { useApp } from "@/lib/context/AppContext";
import { useToast } from "@/lib/context/ToastContext";
import { AppContent, FAQItem } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/constants";
import { isEmail } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const AdminKontenView: React.FC = () => {
  const { showConfirm } = useApp();
  const { showToast } = useToast();

  const [content, setContent] = useState<AppContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  // Landing page form fields
  const [tagline, setTagline] = useState("");
  const [sub, setSub] = useState("");
  const [tentang, setTentang] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // FAQ Modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqErrors, setFaqErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    const c = await contentService.get();
    setContent(c);
    setTagline(c.tagline || "");
    setSub(c.sub || "");
    setTentang(c.tentang || "");
    setEmail(c.email || "");
    setWa(c.wa || "");
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveContent = async () => {
    const newErrors: Record<string, string> = {};
    if (!tagline.trim()) newErrors.tagline = "Tagline wajib diisi.";
    if (!sub.trim()) newErrors.sub = "Subjudul wajib diisi.";
    if (!tentang.trim()) newErrors.tentang = "Teks tentang kami wajib diisi.";
    if (!isEmail(email)) newErrors.email = "Format email tidak valid.";
    if (!wa || !/^[0-9+\-\s()]{8,20}$/.test(wa)) {
      newErrors.wa = "Nomor WhatsApp tidak valid.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await contentService.update({
        tagline: tagline.trim(),
        sub: sub.trim(),
        tentang: tentang.trim(),
        email: email.trim(),
        wa: wa.trim(),
      });
      await loadData();
      showToast("Konten landing page berhasil disimpan.", "success");
    } catch {
      showToast("Gagal menyimpan konten.", "error");
    }
  };

  const handleResetContent = () => {
    showConfirm(
      "Kembalikan konten default?",
      "Seluruh teks landing page dan FAQ dikembalikan ke pengaturan awal.",
      async () => {
        await contentService.reset();
        await loadData();
        showToast("Konten dikembalikan ke default.", "info");
      },
      "Ya, Kembalikan",
      true
    );
  };

  // FAQ Handlers
  const handleOpenAddFaq = () => {
    setEditingFaqIndex(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqErrors({});
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (index: number, f: FAQItem) => {
    setEditingFaqIndex(index);
    setFaqQuestion(f.q);
    setFaqAnswer(f.a);
    setFaqErrors({});
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async () => {
    const newErrors: Record<string, string> = {};
    if (!faqQuestion.trim()) newErrors.q = "Pertanyaan wajib diisi.";
    if (!faqAnswer.trim()) newErrors.a = "Jawaban wajib diisi.";

    setFaqErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await contentService.saveFaq(
        editingFaqIndex !== null ? editingFaqIndex : -1,
        {
          q: faqQuestion.trim(),
          a: faqAnswer.trim(),
        }
      );
      await loadData();
      setFaqModalOpen(false);
      showToast("FAQ berhasil disimpan.", "success");
    } catch {
      showToast("Gagal menyimpan FAQ.", "error");
    }
  };

  const handleDeleteFaq = (index: number, q: string) => {
    showConfirm(
      "Hapus FAQ ini?",
      q,
      async () => {
        await contentService.deleteFaq(index);
        await loadData();
        showToast("FAQ berhasil dihapus.", "success");
      },
      "Ya, Hapus",
      true
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat konten...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Kelola teks landing page, kontak resmi, dan daftar FAQ interaktif.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Landing Page Content */}
        <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
          <h3 className="font-bold text-base text-[#111111] mb-4">
            Konten Landing Page
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Tagline Hero
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {errors.tagline && (
                <div className="text-brand-red text-xs mt-1">{errors.tagline}</div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Subjudul Hero
              </label>
              <textarea
                rows={3}
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {errors.sub && (
                <div className="text-brand-red text-xs mt-1">{errors.sub}</div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Tentang Kami
              </label>
              <textarea
                rows={3}
                value={tentang}
                onChange={(e) => setTentang(e.target.value)}
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {errors.tentang && (
                <div className="text-brand-red text-xs mt-1">{errors.tentang}</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-xs mb-1 text-[#111111]">
                  Email Kontak
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
                />
                {errors.email && (
                  <div className="text-brand-red text-xs mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-xs mb-1 text-[#111111]">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
                />
                {errors.wa && (
                  <div className="text-brand-red text-xs mt-1">{errors.wa}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              type="button"
              onClick={handleSaveContent}
              className="bg-brand-deep hover:bg-brand-green text-white font-semibold text-sm py-2.5 px-5 rounded-smarta-md transition-all shadow-sm"
            >
              Simpan Konten
            </button>
            <button
              type="button"
              onClick={handleResetContent}
              className="border border-brand-line bg-white hover:border-brand-green text-[#111111] font-semibold text-sm py-2.5 px-4 rounded-smarta-md transition-all"
            >
              Kembalikan Default
            </button>
          </div>
        </div>

        {/* FAQ Management */}
        <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#111111]">Daftar FAQ</h3>
            <button
              type="button"
              onClick={handleOpenAddFaq}
              className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              + Tambah
            </button>
          </div>

          <div className="divide-y divide-brand-line max-h-[440px] overflow-y-auto">
            {content.faq.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 hover:bg-bg-app/40 px-2 rounded-xl transition-colors"
              >
                <div className="w-[34px] h-[34px] rounded-xl bg-[#E7F4EA] text-brand-green grid place-items-center shrink-0">
                  <Icon name="doc" size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-sm block truncate text-[#111111]">{f.q}</b>
                  <small className="text-brand-muted text-xs block truncate">
                    {f.a}
                  </small>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditFaq(i, f)}
                    title="Edit"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green text-[#111111] grid place-items-center transition-all"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(i, f.q)}
                    title="Hapus"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red text-[#111111] grid place-items-center transition-all"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      <Modal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={`${editingFaqIndex !== null ? "Edit" : "Tambah"} FAQ`}
      >
        <div className="space-y-3 mt-3">
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Pertanyaan
            </label>
            <input
              type="text"
              value={faqQuestion}
              onChange={(e) => setFaqQuestion(e.target.value)}
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {faqErrors.q && (
              <div className="text-brand-red text-xs mt-1">{faqErrors.q}</div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Jawaban
            </label>
            <textarea
              rows={4}
              value={faqAnswer}
              onChange={(e) => setFaqAnswer(e.target.value)}
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {faqErrors.a && (
              <div className="text-brand-red text-xs mt-1">{faqErrors.a}</div>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-6">
          <button
            type="button"
            onClick={() => setFaqModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveFaq}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
};
