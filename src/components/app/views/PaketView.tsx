"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { packageService } from "@/services/package.service";
import { paymentService } from "@/services/payment.service";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { SubscriptionPackage, PaymentRequest } from "@/types";
import { rp, fmtDate, daysBetween } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const PaketView: React.FC = () => {
  const { currentUser, refreshUser, showConfirm } = useApp();
  const { showToast } = useToast();

  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [latestPayment, setLatestPayment] = useState<PaymentRequest | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<SubscriptionPackage | null>(null);
  const [payProof, setPayProof] = useState<string | null>(null);
  const [payError, setPayError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    const [pkgs, pay] = await Promise.all([
      packageService.listActive(),
      paymentService.getLatestByUser(currentUser.id),
    ]);
    setPackages(pkgs);
    setLatestPayment(pay);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const st = currentUser
    ? authService.getSubscriptionStatus(currentUser)
    : "expired";
  const trialDays = currentUser ? authService.getTrialDaysLeft(currentUser) : 0;

  const currentPkgName =
    packages.find((p) => p.id === currentUser?.plan)?.nama || "—";

  const handleOpenSubscribe = (pkg: SubscriptionPackage) => {
    setSelectedPkg(pkg);
    setPayProof(null);
    setPayError("");
  };

  const handlePickProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setPayError("Bukti pembayaran harus berupa gambar (JPG/PNG/WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPayError("Ukuran file maksimal 2 MB.");
      return;
    }
    setPayError("");
    const reader = new FileReader();
    reader.onload = () => {
      setPayProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!currentUser || !selectedPkg) return;
    if (!payProof) {
      setPayError("Upload bukti pembayaran terlebih dahulu.");
      return;
    }

    try {
      await paymentService.submitRequest({
        userId: currentUser.id,
        packageId: selectedPkg.id,
        amount: selectedPkg.harga,
        proof: payProof,
      });
      setSelectedPkg(null);
      await loadData();
      showToast("Konfirmasi terkirim. Status: Menunggu Verifikasi.", "success");
    } catch {
      showToast("Gagal mengirim konfirmasi pembayaran.", "error");
    }
  };

  const handleCancelSub = () => {
    if (!currentUser) return;
    showConfirm(
      "Batalkan langganan?",
      "Status akan kembali mengikuti masa trial Anda.",
      async () => {
        await paymentService.cancelSubscription(currentUser.id);
        await refreshUser();
        await loadData();
        showToast("Langganan dibatalkan.", "info");
      },
      "Ya, Batalkan",
      true
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat paket...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Status langganan, masa berlaku, dan pilihan paket SMARTA UMKM.
      </p>

      {/* Status banner */}
      {latestPayment && latestPayment.status === "pending" && (
        <div className="bg-white border-l-4 border-brand-gold rounded-smarta-lg p-4.5 mb-4 shadow-smarta1">
          <b className="text-sm block text-[#111111]">
            Pembayaran Anda sedang menunggu verifikasi.
          </b>
          <p className="text-brand-muted text-[13.5px] mt-1 mb-0">
            Diajukan {fmtDate(String(latestPayment.submittedAt).slice(0, 10))} •{" "}
            {packages.find((p) => p.id === latestPayment.packageId)?.nama || "Paket"} •{" "}
            {rp(latestPayment.amount)} • Metode: {latestPayment.method}
          </p>
        </div>
      )}

      {latestPayment && latestPayment.status === "rejected" && (
        <div className="bg-white border-l-4 border-brand-red rounded-smarta-lg p-4.5 mb-4 shadow-smarta1">
          <b className="text-sm block text-brand-red">
            Pengajuan pembayaran ditolak.
          </b>
          <p className="text-brand-muted text-[13.5px] mt-1 mb-0">
            {latestPayment.adminNote
              ? `Alasan admin: ${latestPayment.adminNote}`
              : "Admin tidak menyertakan alasan."}{" "}
            Anda dapat mengajukan ulang pembayaran di bawah.
          </p>
        </div>
      )}

      {st === "active" && (
        <div className="bg-white border-l-4 border-brand-green rounded-smarta-lg p-4.5 mb-4 shadow-smarta1">
          <b className="text-sm block text-brand-green">Langganan aktif.</b>
          <p className="text-brand-muted text-[13.5px] mt-1 mb-0">
            {currentPkgName} • Mulai{" "}
            {fmtDate(String(currentUser?.subStart || "").slice(0, 10))} • Berakhir{" "}
            {fmtDate(String(currentUser?.subEnd || "").slice(0, 10))} • Sisa{" "}
            {Math.max(
              0,
              daysBetween(new Date(), currentUser?.subEnd || new Date().toISOString())
            )}{" "}
            hari
          </p>
        </div>
      )}

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="card" size="sm" />
            Status Langganan
          </div>
          <div className="mt-2">
            <span
              className={`inline-block text-xs font-semibold py-0.5 px-3 rounded-full ${
                st === "active"
                  ? "bg-[#E7F4EA] text-brand-green"
                  : st === "trial"
                  ? "bg-[#FDF3DA] text-[#8a6300]"
                  : "bg-[#FBEBEA] text-brand-red"
              }`}
            >
              {st === "trial" ? "Trial" : st === "active" ? "Aktif" : "Expired"}
            </span>
          </div>
          <div className="text-xs text-brand-muted mt-2">
            {st === "trial"
              ? `Sisa ${trialDays} hari trial`
              : st === "active"
              ? "Langganan berjalan"
              : "Perlu berlangganan"}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="box" size="sm" />
            Paket Saat Ini
          </div>
          <div className="font-serif text-xl font-bold mt-2 text-[#111111]">
            {currentPkgName}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="calendar" size="sm" />
            Masa Berlaku
          </div>
          <div className="font-serif text-xl font-bold mt-2 text-[#111111]">
            {st === "active"
              ? fmtDate((currentUser?.subEnd || "").slice(0, 10))
              : fmtDate(currentUser?.trialEnd.slice(0, 10))}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            {st === "active" ? "Berakhir" : "Trial berakhir"}
          </div>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const isFree = pkg.harga === 0;
          const isCurrentActive = st === "active" && currentUser?.plan === pkg.id;
          const isPending = latestPayment?.status === "pending";

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-smarta-lg p-6 shadow-smarta1 border border-brand-line/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-xl text-[#111111]">
                    {pkg.nama}
                  </h3>
                  {!isFree && (
                    <span className="text-[11px] font-semibold py-0.5 px-2.5 rounded-full bg-[#FDF3DA] text-[#8a6300]">
                      Paling Populer
                    </span>
                  )}
                </div>

                <div className="font-serif text-3xl font-bold mt-2 text-[#111111]">
                  {isFree ? "Gratis" : rp(pkg.harga)}
                </div>
                <small className="text-brand-muted text-xs block mt-0.5">
                  per {pkg.durasi} {pkg.satuan}
                  {!isFree && ` (≈ ${rp(pkg.harga / pkg.durasi)}/bulan)`}
                </small>

                <ul className="list-none p-0 my-5 space-y-2.5 text-sm">
                  {pkg.fitur.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[#111111]">
                      <Icon name="check" size="sm" className="text-brand-green" />
                      <span>{f}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2.5 text-[#111111]">
                    <Icon name="check" size="sm" className="text-brand-green" />
                    <span>
                      {pkg.batas > 0
                        ? `Batas ${pkg.batas} transaksi`
                        : "Transaksi tidak terbatas"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                {!isFree ? (
                  isCurrentActive ? (
                    <div>
                      <button
                        disabled
                        className="w-full py-2.5 rounded-smarta-md border border-brand-line bg-gray-100 text-brand-muted text-sm font-semibold cursor-not-allowed"
                      >
                        Paket Aktif
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSub}
                        className="w-full mt-2 py-2 rounded-smarta-md border border-brand-line bg-white hover:border-brand-red hover:text-brand-red text-xs font-semibold transition-all cursor-pointer"
                      >
                        Batalkan Langganan
                      </button>
                    </div>
                  ) : isPending ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-smarta-md border border-brand-line bg-gray-100 text-brand-muted text-sm font-semibold cursor-not-allowed"
                    >
                      Menunggu Verifikasi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenSubscribe(pkg)}
                      className="w-full py-3 rounded-smarta-md bg-brand-gold hover:bg-[#ffc93c] text-[#3a2c00] font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Berlangganan Sekarang
                    </button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-smarta-md border border-brand-line bg-gray-100 text-brand-muted text-sm font-semibold cursor-not-allowed"
                  >
                    {st === "trial" ? "Trial Sedang Berjalan" : "Trial Sudah Digunakan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice card */}
      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40 mt-4 text-xs sm:text-sm text-brand-muted leading-relaxed">
        <b className="text-sm block text-[#111111] mb-1">Catatan mode demo</b>
        Pembayaran online belum menggunakan payment gateway otomatis pada versi saat ini.
        Sistem menggunakan alur konfirmasi transfer manual/demo: unggah foto bukti transfer,
        lalu admin akan memverifikasi permohonan langganan Anda.
      </div>

      {/* Manual Payment Confirmation Modal */}
      {selectedPkg && (
        <Modal
          isOpen={Boolean(selectedPkg)}
          onClose={() => setSelectedPkg(null)}
          title="Konfirmasi Langganan"
        >
          <div className="space-y-2 text-sm mt-3 divide-y divide-brand-line">
            <div className="flex justify-between py-1.5">
              <span className="text-brand-muted">Paket</span>
              <b className="text-[#111111]">{selectedPkg.nama}</b>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-brand-muted">Harga</span>
              <b className="text-[#111111]">{rp(selectedPkg.harga)}</b>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-brand-muted">Durasi</span>
              <b className="text-[#111111]">
                {selectedPkg.durasi} {selectedPkg.satuan}
              </b>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-brand-muted">Metode</span>
              <b className="text-[#111111]">Pembayaran Manual / Demo</b>
            </div>
          </div>

          <p className="text-brand-muted text-xs mt-3 leading-relaxed">
            Pembayaran online belum tersedia pada versi saat ini. Sistem menggunakan
            alur pembayaran manual/demo dan nantinya dapat diintegrasikan dengan payment gateway.
          </p>

          <div className="mt-4">
            <label className="block font-semibold text-sm mb-1.5 text-[#111111]">
              Upload Bukti Pembayaran
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePickProof}
              className="w-full border border-brand-line rounded-smarta-md p-2 text-xs outline-none bg-white"
            />
            {payError && (
              <div className="text-brand-red text-xs mt-1">{payError}</div>
            )}
          </div>

          {payProof && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payProof}
                alt="Pratinjau bukti pembayaran"
                className="max-h-[140px] rounded-smarta-md border border-brand-line object-cover"
              />
            </div>
          )}

          <div className="flex gap-2.5 justify-end mt-6">
            <button
              type="button"
              onClick={() => setSelectedPkg(null)}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmitPayment}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-gold hover:bg-[#ffc93c] text-[#3a2c00] transition-all shadow-sm"
            >
              Kirim Konfirmasi
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
