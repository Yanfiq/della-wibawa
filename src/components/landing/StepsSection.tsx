import React from "react";

export const StepsSection: React.FC = () => {
  return (
    <section className="bg-[#FAFAF3] text-[#111111] py-16" id="cara">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-brand-gold font-bold tracking-[0.08em] text-[15px]">
          LANGKAH AWAL
        </div>
        <h2 className="font-serif text-3xl font-bold mt-1.5">
          Mulai dalam 5 Menit
        </h2>
        <p className="text-brand-muted mt-2 max-w-[520px]">
          Tidak perlu keahlian akuntansi. Ikuti langkah sederhana berikut.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 mt-9.5">
          {/* Step 1 */}
          <div className="bg-gradient-to-br from-[#F2F5EE] to-[#E6EFE2] rounded-smarta-lg p-5 text-center border border-brand-line/60">
            <div className="w-12 h-12 rounded-full bg-dark-green text-white text-xl font-bold grid place-items-center mx-auto mb-3.5 shadow-sm">
              1
            </div>
            <h3 className="text-[15px] font-bold mb-1.5">Buat Akun</h3>
            <p className="text-[13px] text-brand-muted m-0">
              Daftar dengan email dan isi profil usaha.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-br from-[#F2F5EE] to-[#E6EFE2] rounded-smarta-lg p-5 text-center border border-brand-line/60">
            <div className="w-12 h-12 rounded-full bg-dark-green text-white text-xl font-bold grid place-items-center mx-auto mb-3.5 shadow-sm">
              2
            </div>
            <h3 className="text-[15px] font-bold mb-1.5">Pengaturan Usaha</h3>
            <p className="text-[13px] text-brand-muted m-0">
              Isi nama usaha, jenis usaha, dan pisahkan uang usaha dengan pribadi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-[#F2F5EE] to-[#E6EFE2] rounded-smarta-lg p-5 text-center border border-brand-line/60">
            <div className="w-12 h-12 rounded-full bg-dark-green text-white text-xl font-bold grid place-items-center mx-auto mb-3.5 shadow-sm">
              3
            </div>
            <h3 className="text-[15px] font-bold mb-1.5">Catat Transaksi</h3>
            <p className="text-[13px] text-brand-muted m-0">
              Tambah pemasukan dan pengeluaran harian. Foto struk langsung dari kamera.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-gradient-to-br from-[#F2F5EE] to-[#E6EFE2] rounded-smarta-lg p-5 text-center border border-brand-line/60">
            <div className="w-12 h-12 rounded-full bg-dark-green text-white text-xl font-bold grid place-items-center mx-auto mb-3.5 shadow-sm">
              4
            </div>
            <h3 className="text-[15px] font-bold mb-1.5">Lihat Laporan</h3>
            <p className="text-[13px] text-brand-muted m-0">
              Lihat laporan laba rugi lengkap dengan analisis otomatis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
