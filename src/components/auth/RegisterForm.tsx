"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { isEmail } from "@/lib/utils";

export const RegisterForm: React.FC = () => {
  const { setAuthMode, refreshUser, enterApp } = useApp();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pass: "",
    pass2: "",
    namaUsaha: "",
    jenisUsaha: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama wajib diisi.";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama minimal 3 karakter.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!isEmail(formData.email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!formData.pass) {
      newErrors.pass = "Password wajib diisi.";
    } else if (formData.pass.length < 6) {
      newErrors.pass = "Password minimal 6 karakter.";
    }

    if (!formData.pass2) {
      newErrors.pass2 = "Konfirmasi password wajib diisi.";
    } else if (formData.pass !== formData.pass2) {
      newErrors.pass2 = "Konfirmasi password tidak sama.";
    }

    if (!formData.namaUsaha.trim()) {
      newErrors.namaUsaha = "Nama usaha wajib diisi.";
    }

    if (!formData.jenisUsaha) {
      newErrors.jenisUsaha = "Pilih jenis usaha.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await authService.register({
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        pass: formData.pass,
        namaUsaha: formData.namaUsaha.trim(),
        jenisUsaha: formData.jenisUsaha,
      });
      await refreshUser();
      enterApp();
      showToast("Pendaftaran berhasil. Trial 15 hari Anda dimulai hari ini.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
      setErrors({ email: msg });
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="font-serif text-[26px] font-bold text-[#111111]">
        Daftar Gratis 15 Hari
      </h2>
      <p className="text-brand-muted text-sm mt-1 mb-4.5">
        Tanpa kartu kredit. Semua fitur terbuka selama trial.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Nama */}
        <div className="mb-3.5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Nama pemilik usaha"
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              errors.nama
                ? "border-brand-red focus:border-brand-red"
                : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            }`}
          />
          {errors.nama && (
            <div className="text-brand-red text-[12.5px] mt-1.5">{errors.nama}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-3.5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              errors.email
                ? "border-brand-red focus:border-brand-red"
                : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            }`}
          />
          {errors.email && (
            <div className="text-brand-red text-[12.5px] mt-1.5">{errors.email}</div>
          )}
        </div>

        {/* Passwords grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <div>
            <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
              Password
            </label>
            <input
              type="password"
              name="pass"
              value={formData.pass}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
                errors.pass
                  ? "border-brand-red focus:border-brand-red"
                  : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              }`}
            />
            {errors.pass && (
              <div className="text-brand-red text-[12.5px] mt-1.5">{errors.pass}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="pass2"
              value={formData.pass2}
              onChange={handleChange}
              placeholder="Ulangi password"
              className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
                errors.pass2
                  ? "border-brand-red focus:border-brand-red"
                  : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              }`}
            />
            {errors.pass2 && (
              <div className="text-brand-red text-[12.5px] mt-1.5">{errors.pass2}</div>
            )}
          </div>
        </div>

        {/* Nama Usaha */}
        <div className="mb-3.5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Nama Usaha
          </label>
          <input
            type="text"
            name="namaUsaha"
            value={formData.namaUsaha}
            onChange={handleChange}
            placeholder="Contoh: Toko Sembako Makmur Jaya"
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              errors.namaUsaha
                ? "border-brand-red focus:border-brand-red"
                : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            }`}
          />
          {errors.namaUsaha && (
            <div className="text-brand-red text-[12.5px] mt-1.5">{errors.namaUsaha}</div>
          )}
        </div>

        {/* Jenis Usaha */}
        <div className="mb-5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Jenis Usaha
          </label>
          <select
            name="jenisUsaha"
            value={formData.jenisUsaha}
            onChange={handleChange}
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              errors.jenisUsaha
                ? "border-brand-red focus:border-brand-red"
                : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            }`}
          >
            <option value="">Pilih jenis usaha</option>
            <option value="Usaha Dagang">Usaha Dagang</option>
            <option value="Usaha Jasa">Usaha Jasa</option>
            <option value="Dagang & Jasa">Dagang &amp; Jasa</option>
          </select>
          {errors.jenisUsaha && (
            <div className="text-brand-red text-[12.5px] mt-1.5">{errors.jenisUsaha}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gold hover:bg-[#ffc93c] disabled:opacity-50 text-[#3a2c00] font-semibold text-sm py-3 px-5 rounded-smarta-md transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {loading ? "Memproses..." : "Daftar & Mulai Trial 15 Hari"}
        </button>
      </form>

      <p className="text-center text-brand-muted text-sm mt-4">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className="text-brand-green font-semibold cursor-pointer hover:underline"
        >
          Masuk
        </button>
      </p>
    </div>
  );
};
