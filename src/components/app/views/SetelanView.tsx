"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { settingsService } from "@/services/settings.service";
import { transactionService } from "@/services/transaction.service";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { BusinessProfile, UserSettings } from "@/types";
import { MONTHS } from "@/lib/constants";
import { fmtDate, isEmail, ym } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const SetelanView: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    refreshUser,
    setRoute,
    setSelectedPeriod,
    showConfirm,
    showLanding,
  } = useApp();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<UserSettings>({
    reminderOn: true,
    reminderTime: "20:00",
    monthlyReportNotif: true,
  });
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [archivedMonths, setArchivedMonths] = useState<string[]>([]);

  // Modals state
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizForm, setBizForm] = useState<BusinessProfile>({
    namaUsaha: "",
    jenisUsaha: "Usaha Dagang",
    pemilik: "",
    email: "",
    hp: "",
    alamat: "",
  });
  const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPass: "", newPass: "", newPass2: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    if (!currentUser) return;
    const [prof, st, txs] = await Promise.all([
      settingsService.getProfile(currentUser.id),
      settingsService.getSettings(currentUser.id),
      transactionService.listByUser(currentUser.id),
    ]);
    setProfile(prof);
    setSettings(st);
    const months = Array.from(new Set(txs.map((t) => ym(t.tanggal)))).sort().reverse();
    setArchivedMonths(months);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const isAdmin = currentUser?.role === "admin";
  const st = currentUser ? authService.getSubscriptionStatus(currentUser) : "expired";
  const trialDays = currentUser ? authService.getTrialDaysLeft(currentUser) : 0;

  // Toggle notification settings
  const handleToggleSetting = async (key: keyof UserSettings) => {
    if (!currentUser) return;
    const updated = await settingsService.updateSettings(currentUser.id, {
      [key]: !settings[key],
    });
    setSettings(updated);
    showToast("Pengaturan diperbarui.", "info");
  };

  const handleReminderTimeChange = async (time: string) => {
    if (!currentUser) return;
    const cleanTime = time.replace(" WIB", "");
    const updated = await settingsService.updateSettings(currentUser.id, {
      reminderTime: cleanTime,
    });
    setSettings(updated);
    showToast(`Waktu pengingat diubah ke ${time}.`, "info");
  };

  // Open Edit Profile
  const handleOpenBizModal = () => {
    if (profile) {
      setBizForm(profile);
      setBizErrors({});
      setBizModalOpen(true);
    }
  };

  const handleSaveBiz = async () => {
    if (!currentUser) return;
    const newErrors: Record<string, string> = {};

    if (!bizForm.namaUsaha.trim()) {
      newErrors.namaUsaha = "Nama usaha wajib diisi.";
    } else if (bizForm.namaUsaha.trim().length < 3) {
      newErrors.namaUsaha = "Minimal 3 karakter.";
    }

    if (!bizForm.pemilik.trim()) {
      newErrors.pemilik = "Nama pemilik wajib diisi.";
    }

    if (!bizForm.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!isEmail(bizForm.email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (bizForm.hp && !/^[0-9+\-\s()]{8,20}$/.test(bizForm.hp)) {
      newErrors.hp = "Nomor HP tidak valid.";
    }

    if (bizForm.alamat && bizForm.alamat.length > 160) {
      newErrors.alamat = "Alamat maksimal 160 karakter.";
    }

    setBizErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await settingsService.updateProfile(currentUser.id, bizForm);
      await refreshUser();
      await loadData();
      setBizModalOpen(false);
      showToast("Profil usaha berhasil diperbarui.", "success");
    } catch {
      showToast("Gagal memperbarui profil usaha.", "error");
    }
  };

  // Password Change
  const handleSavePw = async () => {
    if (!currentUser) return;
    const newErrors: Record<string, string> = {};

    if (!pwForm.oldPass) {
      newErrors.oldPass = "Password lama wajib diisi.";
    }
    if (!pwForm.newPass) {
      newErrors.newPass = "Password baru wajib diisi.";
    } else if (pwForm.newPass.length < 6) {
      newErrors.newPass = "Minimal 6 karakter.";
    }
    if (pwForm.newPass !== pwForm.newPass2) {
      newErrors.newPass2 = "Konfirmasi password tidak sama.";
    }

    setPwErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await settingsService.changePassword(
        currentUser.id,
        pwForm.oldPass,
        pwForm.newPass
      );
      setPwModalOpen(false);
      setPwForm({ oldPass: "", newPass: "", newPass2: "" });
      showToast("Password berhasil diubah.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password lama salah.";
      setPwErrors({ oldPass: msg });
    }
  };

  const handleLogout = () => {
    showConfirm(
      "Keluar dari akun?",
      "Anda akan kembali ke halaman beranda. Data tetap tersimpan di browser ini.",
      async () => {
        await authService.logout();
        await refreshUser();
        showLanding();
        showToast("Anda telah keluar.", "info");
      },
      "Ya, Keluar",
      true
    );
  };

  if (isAdmin) {
    return (
      <div>
        <p className="text-brand-muted text-sm -mt-1 mb-5">
          Akun administrator SMARTA UMKM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
            <h3 className="font-bold text-base text-[#111111] mb-3">
              Data Administrator
            </h3>
            <div className="divide-y divide-brand-line text-sm">
              <div className="flex justify-between py-2.5">
                <b className="text-brand-muted">Nama</b>
                <span className="font-semibold text-[#111111]">{currentUser?.nama}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <b className="text-brand-muted">Email</b>
                <span className="font-semibold text-[#111111]">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <b className="text-brand-muted">Role</b>
                <span className="font-semibold text-brand-deep">Administrator</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
            <h3 className="font-bold text-base text-[#111111] mb-2">Keamanan</h3>
            <p className="text-brand-muted text-xs sm:text-sm mb-4">
              Ubah password akun administrator Anda untuk menjaga keamanan sistem.
            </p>
            <button
              type="button"
              onClick={() => {
                setPwForm({ oldPass: "", newPass: "", newPass2: "" });
                setPwErrors({});
                setPwModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-smarta-md border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Ubah Password
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={pwModalOpen}
          onClose={() => setPwModalOpen(false)}
          title="Ubah Password"
        >
          <div className="space-y-3 mt-3">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Password Lama
              </label>
              <input
                type="password"
                value={pwForm.oldPass}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, oldPass: e.target.value }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {pwErrors.oldPass && (
                <div className="text-brand-red text-xs mt-1">{pwErrors.oldPass}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Password Baru
              </label>
              <input
                type="password"
                value={pwForm.newPass}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, newPass: e.target.value }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {pwErrors.newPass && (
                <div className="text-brand-red text-xs mt-1">{pwErrors.newPass}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={pwForm.newPass2}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, newPass2: e.target.value }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {pwErrors.newPass2 && (
                <div className="text-brand-red text-xs mt-1">{pwErrors.newPass2}</div>
              )}
            </div>
          </div>
          <div className="flex gap-2.5 justify-end mt-6">
            <button
              type="button"
              onClick={() => setPwModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSavePw}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
            >
              Simpan
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Kelola profil usaha dan preferensi pengaturan aplikasi.
      </p>

      {/* 3 Main Settings Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Usaha Card */}
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-[#111111]">Data Usaha</h3>
            <button
              type="button"
              onClick={handleOpenBizModal}
              className="text-xs font-semibold py-1 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
            >
              Edit
            </button>
          </div>

          <div className="divide-y divide-brand-line text-xs sm:text-[13px]">
            <div className="flex justify-between py-2">
              <div>
                <b className="block text-[#111111]">Nama Usaha</b>
                <small className="text-brand-muted">Nama di laporan</small>
              </div>
              <span className="font-semibold text-right text-[#111111]">
                {profile?.namaUsaha || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <div>
                <b className="block text-[#111111]">Jenis Usaha</b>
                <small className="text-brand-muted">Dagang atau jasa</small>
              </div>
              <span className="font-semibold text-right text-[#111111]">
                {profile?.jenisUsaha || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <b className="text-brand-muted">Pemilik</b>
              <span className="font-semibold text-right text-[#111111]">
                {profile?.pemilik || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <b className="text-brand-muted">Email</b>
              <span className="font-semibold text-right text-[#111111] truncate max-w-[140px]">
                {profile?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <b className="text-brand-muted">Nomor HP</b>
              <span className="font-semibold text-right text-[#111111]">
                {profile?.hp || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <b className="text-brand-muted">Alamat</b>
              <span className="font-semibold text-right text-[#111111] max-w-[140px] truncate">
                {profile?.alamat || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Notifikasi Pengingat Card */}
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <h3 className="font-bold text-base text-[#111111] mb-3 flex items-center gap-1.5">
            <Icon name="bell" size="sm" />
            Notifikasi Pengingat
          </h3>

          <div className="divide-y divide-brand-line text-xs sm:text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <div>
                <b className="block text-[#111111]">Pengingat Harian</b>
                <small className="text-brand-muted leading-tight block">
                  Ingatkan mencatat transaksi setiap hari
                </small>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting("reminderOn")}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  settings.reminderOn ? "bg-brand-deep" : "bg-[#CFCFC4]"
                }`}
                aria-label="Pengingat harian"
              >
                <i
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.reminderOn ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <b className="block text-[#111111]">Waktu Pengingat</b>
                <small className="text-brand-muted block">Zona waktu WIB</small>
              </div>
              <select
                value={`${settings.reminderTime} WIB`}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="border border-brand-line rounded-smarta-md p-1.5 text-xs bg-white outline-none focus:border-brand-green"
              >
                {["18:00", "19:00", "20:00", "21:00", "22:00"].map((t) => (
                  <option key={t} value={`${t} WIB`}>
                    {t} WIB
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <b className="block text-[#111111]">Laporan Bulanan</b>
                <small className="text-brand-muted leading-tight block">
                  Beri tahu saat laporan siap
                </small>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting("monthlyReportNotif")}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  settings.monthlyReportNotif ? "bg-brand-deep" : "bg-[#CFCFC4]"
                }`}
                aria-label="Notifikasi laporan bulanan"
              >
                <i
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.monthlyReportNotif ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Akun Card */}
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111111] mb-3">Akun</h3>

            <div className="divide-y divide-brand-line text-xs sm:text-[13px]">
              <div className="flex justify-between py-2">
                <b className="text-brand-muted">Status</b>
                <span
                  className={`inline-block text-[11px] font-semibold py-0.5 px-2 rounded-full ${
                    st === "active"
                      ? "bg-[#E7F4EA] text-brand-green"
                      : st === "trial"
                      ? "bg-[#FDF3DA] text-[#8a6300]"
                      : "bg-[#FBEBEA] text-brand-red"
                  }`}
                >
                  {st === "trial"
                    ? `Trial (${trialDays} hari)`
                    : st === "active"
                    ? "Aktif"
                    : "Expired"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <b className="text-brand-muted">Paket</b>
                <span className="font-semibold text-[#111111]">
                  {currentUser?.plan === "pkg_6bulan"
                    ? "Langganan 6 Bulan"
                    : "Uji Coba Gratis"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <b className="text-brand-muted">Email Login</b>
                <span className="font-semibold text-[#111111] truncate max-w-[140px]">
                  {currentUser?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setPwForm({ oldPass: "", newPass: "", newPass2: "" });
                setPwErrors({});
                setPwModalOpen(true);
              }}
              className="w-full py-2.5 rounded-smarta-md border border-brand-line bg-white hover:border-brand-green text-[#111111] text-xs font-semibold transition-all"
            >
              Ubah Password
            </button>
            <button
              type="button"
              onClick={() => setRoute("paket")}
              className="w-full py-2.5 rounded-smarta-md border border-brand-line bg-white hover:border-brand-green text-[#111111] text-xs font-semibold transition-all"
            >
              Kelola Langganan
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-smarta-md bg-brand-red hover:bg-[#c9433f] text-white text-xs font-semibold transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Arsip Keuangan Bulan Sebelumnya */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 mt-4">
        <h3 className="font-serif font-bold text-lg text-[#111111] mb-3 flex items-center gap-1.5">
          <Icon name="folder" size="sm" />
          Arsip Keuangan Bulan Sebelumnya
        </h3>

        {archivedMonths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {archivedMonths.map((p) => {
              const [my, mm] = p.split("-");
              return (
                <div
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setRoute("labarugi");
                  }}
                  className="border border-brand-line rounded-smarta-md p-3 px-3.5 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-lime hover:shadow-smarta1 transition-all"
                >
                  <Icon name="calendar" className="text-brand-deep w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <b className="block text-sm text-[#111111] truncate">
                      {MONTHS[+mm - 1]}
                    </b>
                    <small className="text-brand-muted text-xs block truncate">
                      {my}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-brand-muted text-sm">
            Belum ada arsip.
          </div>
        )}
      </div>

      {/* Edit Business Profile Modal */}
      <Modal
        isOpen={bizModalOpen}
        onClose={() => setBizModalOpen(false)}
        title="Edit Data Usaha"
      >
        <div className="space-y-3 mt-3">
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Nama Usaha
            </label>
            <input
              type="text"
              value={bizForm.namaUsaha}
              onChange={(e) =>
                setBizForm((p) => ({ ...p, namaUsaha: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {bizErrors.namaUsaha && (
              <div className="text-brand-red text-xs mt-1">{bizErrors.namaUsaha}</div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Jenis Usaha
            </label>
            <select
              value={bizForm.jenisUsaha}
              onChange={(e) =>
                setBizForm((p) => ({ ...p, jenisUsaha: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
            >
              <option value="Usaha Dagang">Usaha Dagang</option>
              <option value="Usaha Jasa">Usaha Jasa</option>
              <option value="Dagang & Jasa">Dagang &amp; Jasa</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Pemilik
              </label>
              <input
                type="text"
                value={bizForm.pemilik}
                onChange={(e) =>
                  setBizForm((p) => ({ ...p, pemilik: e.target.value }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {bizErrors.pemilik && (
                <div className="text-brand-red text-xs mt-1">{bizErrors.pemilik}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Email
              </label>
              <input
                type="email"
                value={bizForm.email}
                onChange={(e) =>
                  setBizForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {bizErrors.email && (
                <div className="text-brand-red text-xs mt-1">{bizErrors.email}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Nomor HP
            </label>
            <input
              type="text"
              placeholder="0812-3456-7890"
              value={bizForm.hp}
              onChange={(e) =>
                setBizForm((p) => ({ ...p, hp: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {bizErrors.hp && (
              <div className="text-brand-red text-xs mt-1">{bizErrors.hp}</div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Alamat
            </label>
            <textarea
              rows={2}
              value={bizForm.alamat}
              onChange={(e) =>
                setBizForm((p) => ({ ...p, alamat: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {bizErrors.alamat && (
              <div className="text-brand-red text-xs mt-1">{bizErrors.alamat}</div>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-6">
          <button
            type="button"
            onClick={() => setBizModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveBiz}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
          >
            Simpan Perubahan
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
        title="Ubah Password"
      >
        <div className="space-y-3 mt-3">
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Password Lama
            </label>
            <input
              type="password"
              value={pwForm.oldPass}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, oldPass: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {pwErrors.oldPass && (
              <div className="text-brand-red text-xs mt-1">{pwErrors.oldPass}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Password Baru
            </label>
            <input
              type="password"
              value={pwForm.newPass}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, newPass: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {pwErrors.newPass && (
              <div className="text-brand-red text-xs mt-1">{pwErrors.newPass}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={pwForm.newPass2}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, newPass2: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {pwErrors.newPass2 && (
              <div className="text-brand-red text-xs mt-1">{pwErrors.newPass2}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2.5 justify-end mt-6">
          <button
            type="button"
            onClick={() => setPwModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSavePw}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
};
