import React from "react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#04361f] via-brand-deep to-brand-green text-white py-10 rounded-t-smarta-xl">
      <div className="max-w-[1180px] mx-auto px-5 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-6 items-start">
        <div>
          <div className="font-serif text-[21px] flex items-center gap-1.5">
            SMARTA <em className="text-brand-gold not-italic font-sans text-base font-bold">UMKM</em>
          </div>
          <p className="text-[13.5px] opacity-85 mt-2 mb-1">
            Catat keuangan, tingkatkan keuntungan
          </p>
          <p className="text-[13px] opacity-75 m-0">smartaumkm@gmail.com</p>
        </div>

        <div>
          <b className="text-sm">Produk</b>
          <div className="mt-2 flex flex-col gap-1.5 text-[13.5px]">
            <a href="#fitur" className="opacity-85 hover:text-brand-gold transition-colors">
              Fitur
            </a>
            <a href="#harga" className="opacity-85 hover:text-brand-gold transition-colors">
              Harga
            </a>
            <a href="#cara" className="opacity-85 hover:text-brand-gold transition-colors">
              Cara Pakai
            </a>
          </div>
        </div>

        <div>
          <b className="text-sm">Informasi</b>
          <div className="mt-2 flex flex-col gap-1.5 text-[13.5px]">
            <a href="#bantuan" className="opacity-85 hover:text-brand-gold transition-colors">
              Bantuan
            </a>
            <a href="#tentang" className="opacity-85 hover:text-brand-gold transition-colors">
              Tentang Kami
            </a>
            <a href="#bantuan" className="opacity-85 hover:text-brand-gold transition-colors">
              Kebijakan Privasi &amp; Ketentuan
            </a>
          </div>
        </div>

        <div className="col-span-full border-t border-white/15 pt-3.5 text-xs opacity-80 mt-2">
          @2026 SMARTA UMKM. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
};
