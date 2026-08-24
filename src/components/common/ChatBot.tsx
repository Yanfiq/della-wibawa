"use client";

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";
import { contentService } from "@/services/content.service";
import { AppContent } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/constants";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<AppContent>(DEFAULT_CONTENT);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Halo! Saya Asisten SMARTA UMKM. Ada yang bisa saya bantu?",
    },
  ]);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    contentService.get().then((c) => setContent(c));
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const getBotReply = (q: string): string => {
    const s = q.toLowerCase();
    if (/gateway|midtrans|xendit|tripay/.test(s)) {
      return "Versi saat ini belum memakai payment gateway. Pembayaran memakai alur manual/demo: upload bukti pembayaran, lalu admin memverifikasi.";
    }
    if (/bayar|pembayaran|verifikasi|bukti/.test(s)) {
      return "Pilih Paket Langganan, klik Berlangganan, lalu unggah bukti pembayaran dan kirim konfirmasi. Status akan menjadi Menunggu Verifikasi sampai admin menyetujui.";
    }
    if (/harga|biaya|langganan|paket/.test(s)) {
      return "Paket Langganan SMARTA UMKM Rp 51.000 untuk 6 bulan (sekitar Rp 8.500/bulan), setelah trial gratis 15 hari.";
    }
    if (/trial|coba|gratis/.test(s)) {
      return "Trial gratis berlaku 15 hari dengan semua fitur terbuka. Sisa hari trial tampil di dashboard.";
    }
    if (/daftar|registrasi|akun/.test(s)) {
      return "Klik Daftar Gratis, isi nama, email, password, nama usaha, dan jenis usaha. Trial 15 hari langsung aktif.";
    }
    if (/pemasukan/.test(s)) {
      return "Pemasukan dicatat lewat Tambah Transaksi: pilih Pemasukan, isi tanggal, nominal, kategori (misal Penjualan Produk), dan akun keuangan.";
    }
    if (/pengeluaran/.test(s)) {
      return "Pengeluaran dicatat lewat Tambah Transaksi: pilih Pengeluaran, isi tanggal, nominal, kategori (misal Pembelian Barang), dan akun keuangan.";
    }
    if (/catat|transaksi|input/.test(s)) {
      return "Buka menu Tambah Transaksi, pilih pemasukan atau pengeluaran, isi tanggal, nominal, kategori, akun keuangan, lalu Simpan Transaksi.";
    }
    if (/laba|rugi|laporan/.test(s)) {
      return "Laporan Laba Rugi dihitung otomatis dari transaksi keuangan usaha, lengkap dengan interpretasi kondisi keuangan dan tombol Download PDF.";
    }
    if (/pribadi|usaha|pisah/.test(s)) {
      return "Setiap transaksi punya pilihan Keuangan Usaha atau Keuangan Pribadi. Transaksi pribadi tidak masuk laporan laba rugi usaha.";
    }
    if (/foto|kamera|struk|nota/.test(s)) {
      return "Pada form Tambah Transaksi Anda bisa Upload Bukti Transaksi atau Ambil Foto dari Kamera perangkat.";
    }
    if (/lupa|password/.test(s)) {
      return `Gunakan menu Setelan > Ubah Password saat sudah masuk. Jika lupa, hubungi ${content.email || "smartaumkm@gmail.com"}.`;
    }
    if (/pakai|cara|mulai|panduan|smarta/.test(s)) {
      return "Alurnya: daftar akun, lengkapi profil usaha, catat transaksi harian, lalu baca Laporan Laba Rugi. Semua menu ada di sidebar setelah login.";
    }
    if (/hubungi|kontak|admin|bantuan/.test(s)) {
      return `Hubungi kami di ${content.email || "smartaumkm@gmail.com"} atau WhatsApp ${content.wa || "-"}.`;
    }
    return "Maaf, saya belum paham pertanyaan itu. Coba tanyakan cara mencatat transaksi, pemasukan, pengeluaran, laporan laba rugi, trial 15 hari, paket langganan, atau pembayaran.";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = getBotReply(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: reply,
        },
      ]);
    }, 400);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-2.5 no-print">
        <span className="hidden sm:inline-block bg-brand-gold text-[#3a2c00] font-semibold text-[12.5px] py-1.5 px-3.5 rounded-full shadow-sm">
          Chat 24 Jam
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka chat bantuan"
          className="w-[52px] h-[52px] rounded-full bg-white text-brand-deep shadow-smarta2 border-0 cursor-pointer grid place-items-center hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
            <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12z" />
          </svg>
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-5 bottom-[86px] w-[min(330px,calc(100vw-40px))] bg-white rounded-smarta-lg shadow-smarta2 z-[60] overflow-hidden text-[#111111] animate-in fade-in slide-in-from-bottom-4 duration-200 border border-brand-line no-print">
          <header className="bg-brand-deep text-white px-4 py-3 font-semibold text-sm flex items-center justify-between">
            <span>Asisten SMARTA</span>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-0 text-white cursor-pointer text-lg leading-none"
              aria-label="Tutup chat"
            >
              &times;
            </button>
          </header>
          <div
            ref={logRef}
            className="max-h-[270px] overflow-y-auto p-3.5 flex flex-col gap-2.5 bg-bg-app text-[13.5px]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] py-2 px-3 rounded-xl ${
                  m.sender === "bot"
                    ? "bg-white border border-brand-line text-[#111111]"
                    : "bg-brand-deep text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSend}
            className="flex gap-2 p-2.5 border-t border-brand-line bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan..."
              className="flex-1 border border-brand-line rounded-full px-3.5 py-2 text-[13.5px] outline-none focus:border-brand-green"
              aria-label="Pesan"
            />
            <button
              type="submit"
              className="bg-brand-deep hover:bg-brand-green text-white text-xs font-semibold px-3 py-2 rounded-full transition-all"
            >
              Kirim
            </button>
          </form>
        </div>
      )}
    </>
  );
};
