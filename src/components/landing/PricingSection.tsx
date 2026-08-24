"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";

export const PricingSection: React.FC = () => {
  const { openAuth } = useApp();

  return (
    <section className="bg-white text-[#111111] py-16" id="harga">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-brand-gold font-bold tracking-[0.08em] text-[15px]">
          HARGA TERJANGKAU
        </div>
        <h2 className="font-serif text-3xl font-bold mt-1.5 leading-tight">
          Investasi Kecil,
          <br />
          Manfaat Besar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[820px] mx-auto mt-10">
          {/* Free Trial */}
          <div className="bg-[#D4D4D4] rounded-smarta-lg p-7 relative text-[#111111] flex flex-col justify-between">
            <div>
              <div className="text-[17px] font-semibold">Uji Coba</div>
              <div className="text-[34px] font-bold leading-[1.1] mt-1">Gratis</div>
              <small className="text-brand-muted text-xs">15 hari pertama</small>
              <ul className="list-none p-0 my-5 grid gap-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-green stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Semua fitur lengkap</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-green stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Hingga 100 transaksi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-green stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>1 akun usaha</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-green stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Laporan laba rugi</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => openAuth("register")}
              className="w-full bg-brand-deep hover:bg-brand-green text-white font-semibold text-sm py-3 px-5 rounded-smarta-md transition-all shadow-sm active:scale-95"
            >
              Mulai Gratis
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-dark-green rounded-smarta-lg p-7 relative text-white flex flex-col justify-between shadow-smarta2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-[#3a2c00] font-bold text-[13px] py-1.5 px-5 rounded-full whitespace-nowrap shadow-smarta1">
              🔥 Paling Populer
            </div>
            <div>
              <div className="text-[17px] font-semibold">Langganan</div>
              <div className="text-[34px] font-bold leading-[1.1] mt-1 text-white">
                Rp 51.000
              </div>
              <small className="text-white/85 text-xs">per 6 bulan (Rp8.500/bulan)</small>
              <ul className="list-none p-0 my-5 grid gap-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Semua fitur lengkap</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Transaksi tidak terbatas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Pisah keuangan pribadi &amp; usaha</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Download laporan PDF</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Helpdesk email prioritas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-brand-lime stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  <span>Chat bot 24 jam</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => openAuth("register")}
              className="w-full bg-brand-gold hover:bg-[#ffc93c] text-[#3a2c00] font-semibold text-sm py-3 px-5 rounded-smarta-md transition-all shadow-sm active:scale-95"
            >
              Berlangganan Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
