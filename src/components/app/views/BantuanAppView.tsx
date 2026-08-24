"use client";

import React, { useEffect, useState } from "react";
import { contentService } from "@/services/content.service";
import { FAQItem, AppContent } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/constants";

export const BantuanAppView: React.FC = () => {
  const [content, setContent] = useState<AppContent>(DEFAULT_CONTENT);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    contentService.get().then((c) => setContent(c));
  }, []);

  const faqs: FAQItem[] =
    content.faq && content.faq.length > 0 ? content.faq : DEFAULT_CONTENT.faq;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Panduan penggunaan SMARTA UMKM. Klik pertanyaan untuk melihat jawaban.
      </p>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 mb-4">
        <h3 className="font-bold text-base text-[#111111] mb-4">
          Tanya Jawab Penggunaan
        </h3>
        <div className="space-y-2.5">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white border border-brand-line rounded-smarta-md overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(i)}
                  className="w-full flex justify-between items-center gap-3 p-3.5 px-4 bg-transparent border-0 text-left font-semibold text-sm cursor-pointer text-[#111111] hover:text-brand-deep transition-colors"
                >
                  <span>{f.q}</span>
                  <svg
                    className={`w-4 h-4 stroke-current fill-none stroke-[2] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-brand-muted text-xs sm:text-sm leading-relaxed border-t border-brand-line/40 pt-2.5">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Roadmap / Handoff Note Card */}
      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40 mb-4">
        <h3 className="font-bold text-base text-[#111111] mb-2">
          Status Produk (Catatan Pengembangan)
        </h3>
        <p className="text-brand-muted text-xs sm:text-[13.5px] leading-relaxed mb-0">
          SMARTA UMKM saat ini telah diintegrasikan ke Next.js dengan service functions decoupled yang siap dihubungkan ke backend database, authentication production, secure cloud storage untuk foto nota, dan payment gateway resmi.
        </p>
      </div>

      {/* Helpdesk Card */}
      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
        <h3 className="font-bold text-base text-[#111111] mb-2">
          Masih butuh bantuan?
        </h3>
        <p className="text-brand-muted text-xs sm:text-[13.5px] leading-relaxed mb-0">
          Hubungi helpdesk SMARTA UMKM melalui email{" "}
          <b className="text-[#111111]">{content.email || "smartaumkm@gmail.com"}</b> atau
          gunakan chat bot 24 jam di kanan bawah halaman aplikasi.
        </p>
      </div>
    </div>
  );
};
