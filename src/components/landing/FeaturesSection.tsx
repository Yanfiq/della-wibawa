import React from "react";

export const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-[#FAFAF3] text-[#111111] py-16" id="fitur">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-brand-gold font-bold tracking-[0.08em] text-[15px]">
          FITUR UNGGULAN
        </div>
        <h2 className="font-serif text-3xl font-bold mt-1.5">
          Semua yang Dibutuhkan Usaha Anda
        </h2>
        <p className="text-brand-muted mt-2 max-w-[520px]">
          Dirancang khusus untuk UMKM Indonesia — simpel, efisien, dan dapat diandalkan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5.5 mt-9.5">
          {/* 1 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="12.5" r="3.2" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Foto Transaksi</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Ambil foto nota langsung dari kamera. Bukti transaksi tersimpan bersama catatannya.
            </p>
          </div>

          {/* 2 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7" />
                <path d="M10.5 20a2 2 0 0 0 3 0" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Notifikasi Pengingat</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Dapatkan pengingat untuk mencatat transaksi agar tidak ada yang terlewat.
            </p>
          </div>

          {/* 3 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M4 20V9m5 11V4m5 16v-7m5 7V7" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Laporan Laba Rugi</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Laporan bulanan otomatis lengkap dengan interpretasi kondisi keuangan.
            </p>
          </div>

          {/* 4 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M3 8l2-4h14l2 4M12 12v4" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Pisah Keuangan Usaha &amp; Pribadi</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Kelola dua jenis keuangan dalam satu akun secara transparan.
            </p>
          </div>

          {/* 5 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Download Laporan PDF</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Unduh laporan laba rugi dalam format siap cetak dan mudah dibagikan.
            </p>
          </div>

          {/* 6 */}
          <div className="bg-[#A8CBA4] rounded-smarta-lg p-5 transition-all hover:-translate-y-1 hover:shadow-smarta2">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-brand-gold grid place-items-center mb-3.5">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-1.5">Arsip Keuangan</h3>
            <p className="text-[13.5px] text-[#1d3a2a]">
              Akses kembali laporan keuangan berdasarkan periode dengan mudah.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
