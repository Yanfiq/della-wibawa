"use client";

import React, { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { packageService } from "@/services/package.service";
import { settingsService } from "@/services/settings.service";
import { useApp } from "@/lib/context/AppContext";
import { useToast } from "@/lib/context/ToastContext";
import { PaymentRequest, SubscriptionPackage, User } from "@/types";
import { rp, fmtDate } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const AdminPembayaranView: React.FC = () => {
  const { showConfirm } = useApp();
  const { showToast } = useToast();

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Proof View Modal
  const [viewProofReq, setViewProofReq] = useState<PaymentRequest | null>(null);

  // Reject Modal
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");

  const loadData = async () => {
    const [reqs, pkgs, allUsers] = await Promise.all([
      paymentService.listAll(),
      packageService.listAll(),
      settingsService.listAllUsers(),
    ]);
    setPaymentRequests(reqs);
    setPackages(pkgs);
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (req: PaymentRequest) => {
    const user = users.find((u) => u.id === req.userId);
    showConfirm(
      "Setujui pembayaran ini?",
      `${
        user?.nama || "Pengguna"
      } akan mendapatkan langganan aktif selama 6 bulan sejak hari ini.`,
      async () => {
        await paymentService.approve(req.id);
        await loadData();
        showToast("Pembayaran disetujui. Langganan telah aktif.", "success");
      },
      "Ya, Setujui",
      false
    );
  };

  const handleOpenReject = (reqId: string) => {
    setRejectReqId(reqId);
    setRejectNote("");
    setRejectError("");
  };

  const handleSaveReject = async () => {
    if (!rejectReqId) return;
    if (!rejectNote.trim()) {
      setRejectError("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      await paymentService.reject(rejectReqId, rejectNote.trim());
      await loadData();
      setRejectReqId(null);
      showToast("Pengajuan pembayaran ditolak.", "info");
    } catch {
      showToast("Gagal menolak pengajuan pembayaran.", "error");
    }
  };

  const pendingCount = paymentRequests.filter((r) => r.status === "pending").length;
  const approvedCount = paymentRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = paymentRequests.filter((r) => r.status === "rejected").length;

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat pembayaran...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Verifikasi pengajuan pembayaran manual/demo dari pengguna.
      </p>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="inbox" size="sm" />
            Menunggu Verifikasi
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 text-[#111111]">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="check" size="sm" />
            Disetujui
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 text-brand-green">
            {approvedCount}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="bell" size="sm" />
            Ditolak
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 text-brand-red">
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Payment Requests List */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
        <h3 className="font-bold text-base text-[#111111] mb-3">
          Daftar Pengajuan
        </h3>

        <div className="divide-y divide-brand-line">
          {paymentRequests.length > 0 ? (
            paymentRequests.map((r) => {
              const u = users.find((x) => x.id === r.userId) || {
                nama: "(Dihapus)",
                email: "-",
              };
              const pkgName =
                packages.find((p) => p.id === r.packageId)?.nama || "Paket";

              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 py-3.5 hover:bg-bg-app/40 px-2 rounded-xl transition-colors flex-wrap sm:flex-nowrap"
                >
                  <div className="w-[38px] h-[38px] rounded-xl bg-[#E7F4EA] text-brand-green grid place-items-center shrink-0">
                    <Icon name="card" size="sm" />
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <b className="text-[#111111] text-sm">{u.nama}</b>
                      <span
                        className={`inline-block text-[10.5px] font-semibold py-0.5 px-2 rounded-full ${
                          r.status === "pending"
                            ? "bg-[#FDF3DA] text-[#8a6300]"
                            : r.status === "approved"
                            ? "bg-[#E7F4EA] text-brand-green"
                            : "bg-[#FBEBEA] text-brand-red"
                        }`}
                      >
                        {r.status === "pending"
                          ? "Menunggu Verifikasi"
                          : r.status === "approved"
                          ? "Disetujui"
                          : "Ditolak"}
                      </span>
                    </div>
                    <small className="text-brand-muted text-xs block leading-relaxed mt-0.5">
                      {u.email} • {pkgName} • {rp(r.amount)} • {r.method} • Diajukan{" "}
                      {fmtDate(String(r.submittedAt).slice(0, 10))}
                    </small>
                    {r.status === "rejected" && r.adminNote && (
                      <small className="text-brand-red text-xs block mt-0.5">
                        Alasan: {r.adminNote}
                      </small>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setViewProofReq(r)}
                      title="Lihat Bukti"
                      className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green text-[#111111] grid place-items-center transition-all"
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    {r.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(r)}
                          className="bg-brand-deep hover:bg-brand-green text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(r.id)}
                          className="bg-brand-red hover:bg-[#c9433f] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-brand-muted text-sm text-center py-6 m-0">
              Belum ada permintaan pembayaran.
            </p>
          )}
        </div>
      </div>

      {/* View Proof Modal */}
      {viewProofReq && (
        <Modal
          isOpen={Boolean(viewProofReq)}
          onClose={() => setViewProofReq(null)}
          title="Bukti Pembayaran"
        >
          <p className="text-brand-muted text-xs -mt-1 mb-3">
            {packages.find((p) => p.id === viewProofReq.packageId)?.nama || "Paket"} •{" "}
            {rp(viewProofReq.amount)} •{" "}
            {fmtDate(String(viewProofReq.submittedAt).slice(0, 10))}
          </p>

          {viewProofReq.proof ? (
            <div className="rounded-smarta-md overflow-hidden border border-brand-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewProofReq.proof}
                alt="Bukti pembayaran"
                className="w-full max-h-[300px] object-contain bg-black/5"
              />
            </div>
          ) : (
            <p className="text-brand-muted text-sm">Tidak ada bukti terlampir.</p>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setViewProofReq(null)}
              className="px-5 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
            >
              Tutup
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {rejectReqId && (
        <Modal
          isOpen={Boolean(rejectReqId)}
          onClose={() => setRejectReqId(null)}
          title="Tolak Pengajuan Pembayaran"
        >
          <div className="mt-3">
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Alasan Penolakan
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Bukti transfer tidak jelas atau nominal tidak sesuai."
              value={rejectNote}
              onChange={(e) => {
                setRejectNote(e.target.value);
                setRejectError("");
              }}
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-red"
            />
            {rejectError && (
              <div className="text-brand-red text-xs mt-1">{rejectError}</div>
            )}
          </div>

          <div className="flex gap-2.5 justify-end mt-6">
            <button
              type="button"
              onClick={() => setRejectReqId(null)}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveReject}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-red text-white"
            >
              Tolak Pengajuan
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
