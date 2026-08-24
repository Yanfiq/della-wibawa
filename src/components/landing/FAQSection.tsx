"use client";

import React, { useState } from "react";
import { FAQItem } from "@/types";

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white text-[#111111] py-16" id="bantuan">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-brand-gold font-bold tracking-[0.08em] text-[15px]">
          BANTUAN
        </div>
        <h2 className="font-serif text-3xl font-bold mt-1.5">
          Pertanyaan yang Sering Diajukan
        </h2>

        <div className="max-w-[820px] mx-auto mt-8 flex flex-col gap-2.5">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white border border-brand-line rounded-smarta-md overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(i)}
                  className="w-full flex justify-between items-center gap-3 p-4 px-5 bg-transparent border-0 text-left font-semibold cursor-pointer text-[#111111] hover:text-brand-deep transition-colors"
                >
                  <span className="text-[14.5px]">{f.q}</span>
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
                  <div className="px-5 pb-4 text-brand-muted text-sm leading-relaxed border-t border-brand-line/40 pt-3 animate-in fade-in duration-150">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
