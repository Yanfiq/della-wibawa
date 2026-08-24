import React from "react";
import { AppContent } from "@/types";

interface AboutSectionProps {
  content?: AppContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  return (
    <section className="bg-[#FAFAF3] text-[#111111] py-16" id="tentang">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-brand-gold font-bold tracking-[0.08em] text-[15px]">
          TENTANG KAMI
        </div>
        <h2 className="font-serif text-3xl font-bold mt-1.5">
          {content?.aboutTitle || "Tentang SMARTA UMKM"}
        </h2>
        <p className="text-brand-muted mt-2 max-w-[720px] text-[15px] leading-relaxed">
          {content?.about ||
            "SMARTA UMKM adalah platform pencatatan keuangan sederhana yang membantu UMKM mencatat transaksi, memisahkan keuangan usaha dan pribadi, serta memahami kondisi keuangan usaha."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1">
            <h3 className="text-base font-bold mb-2">Visi</h3>
            <p className="text-brand-muted text-sm leading-relaxed m-0">
              {content?.visi ||
                "Menjadi pendamping keuangan digital yang paling mudah digunakan oleh pelaku UMKM di Indonesia."}
            </p>
          </div>
          <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1">
            <h3 className="text-base font-bold mb-2">Misi</h3>
            <p className="text-brand-muted text-sm leading-relaxed m-0">
              {content?.misi ||
                "Menyediakan pembukuan sederhana, laporan laba rugi otomatis, dan edukasi keuangan yang membumi bagi usaha dagang dan jasa."}
            </p>
          </div>
          <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1">
            <h3 className="text-base font-bold mb-2">Kontak</h3>
            <p className="text-brand-muted text-sm leading-relaxed m-0">
              Email: <b className="text-[#111111]">{content?.email || "smartaumkm@gmail.com"}</b>
              <br />
              WhatsApp: {content?.wa || "0812-3456-7890"}
              <br />
              Surakarta, Jawa Tengah
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
