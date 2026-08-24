"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";

export const LandingNav: React.FC = () => {
  const { openAuth } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[rgba(6,77,44,0.94)] backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-[1180px] mx-auto px-5 h-[74px] flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 font-serif text-2xl tracking-[0.06em] text-white">
          SMARTA
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 ml-6 pb-1.5 border-b-2 border-brand-gold">
          <a href="#fitur" className="font-semibold text-[15px] text-white/95 hover:text-brand-gold transition-colors">
            Fitur
          </a>
          <a href="#harga" className="font-semibold text-[15px] text-white/95 hover:text-brand-gold transition-colors">
            Harga
          </a>
          <a href="#cara" className="font-semibold text-[15px] text-white/95 hover:text-brand-gold transition-colors">
            Cara Pakai
          </a>
          <a href="#bantuan" className="font-semibold text-[15px] text-white/95 hover:text-brand-gold transition-colors">
            Bantuan
          </a>
          <a href="#tentang" className="font-semibold text-[15px] text-white/95 hover:text-brand-gold transition-colors">
            Tentang
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <button
            onClick={() => openAuth("login")}
            className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#ffc93c] transition-all"
          >
            Masuk
          </button>
          <button
            onClick={() => openAuth("register")}
            className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#ffc93c] transition-all"
          >
            Daftar Gratis
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-auto bg-transparent border border-white/30 rounded-xl p-2 text-white"
          aria-label="Menu"
        >
          <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-green border-b-2 border-brand-gold px-5 py-4 flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold text-white hover:text-brand-gold py-1"
          >
            Fitur
          </a>
          <a
            href="#harga"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold text-white hover:text-brand-gold py-1"
          >
            Harga
          </a>
          <a
            href="#cara"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold text-white hover:text-brand-gold py-1"
          >
            Cara Pakai
          </a>
          <a
            href="#bantuan"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold text-white hover:text-brand-gold py-1"
          >
            Bantuan
          </a>
          <a
            href="#tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold text-white hover:text-brand-gold py-1"
          >
            Tentang
          </a>
          <div className="flex gap-2 pt-2 border-t border-white/20">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuth("login");
              }}
              className="flex-1 bg-brand-gold text-[#3a2c00] font-semibold text-sm py-2 rounded-full text-center"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuth("register");
              }}
              className="flex-1 bg-brand-gold text-[#3a2c00] font-semibold text-sm py-2 rounded-full text-center"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
