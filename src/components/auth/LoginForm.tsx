"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { isEmail } from "@/lib/utils";

export const LoginForm: React.FC = () => {
  const { setAuthMode, refreshUser, enterApp } = useApp();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email wajib diisi.";
    } else if (!isEmail(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const user = await authService.login(email, password);
      await refreshUser();
      enterApp();
      showToast(`Selamat datang kembali, ${user.nama}!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      setErrors({ password: msg });
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="font-serif text-[26px] font-bold text-[#111111]">
        Masuk ke Akun Anda
      </h2>
      <p className="text-brand-muted text-sm mt-1 mb-4.5">
        Catat keuangan, tingkatkan keuntungan.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="mb-3.5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
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

        {/* Password */}
        <div className="mb-4.5">
          <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••"
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              errors.password
                ? "border-brand-red focus:border-brand-red"
                : "border-brand-line focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            }`}
          />
          {errors.password && (
            <div className="text-brand-red text-[12.5px] mt-1.5">{errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-deep hover:bg-brand-green disabled:opacity-50 text-white font-semibold text-sm py-3 px-5 rounded-smarta-md transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center text-brand-muted text-sm mt-4">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("register")}
          className="text-brand-green font-semibold cursor-pointer hover:underline"
        >
          Daftar Gratis
        </button>
      </p>

      {/* Demo accounts hint */}
      <div className="bg-[#F3F7EF] border border-dashed border-brand-lime rounded-smarta-md p-3 px-3.5 text-[12.5px] text-[#2c4a37] mt-3.5 leading-relaxed">
        <b>Akun demo:</b>
        <br />
        User — demo@smartaumkm.id / demo123
        <br />
        Admin — admin@smartaumkm.id / admin123
      </div>
    </div>
  );
};
