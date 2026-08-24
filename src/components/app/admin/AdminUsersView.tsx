"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { settingsService } from "@/services/settings.service";
import { packageService } from "@/services/package.service";
import { transactionService } from "@/services/transaction.service";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { User, SubscriptionPackage, Transaction } from "@/types";
import { rp, fmtDate, totals } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const AdminUsersView: React.FC = () => {
  const { showConfirm } = useApp();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Status Change Modal
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<"trial" | "active" | "expired">("trial");
  const [newPlan, setNewPlan] = useState<string>("pkg_trial");

  const loadData = async () => {
    const [allUsers, pkgs] = await Promise.all([
      settingsService.listAllUsers(),
      packageService.listAll(),
    ]);
    setUsers(allUsers);
    setPackages(pkgs);

    // Fetch transactions for all users for stats
    const txsPromises = allUsers.map((u) => transactionService.listByUser(u.id));
    const allTxsNested = await Promise.all(txsPromises);
    setAllTransactions(allTxsNested.flat());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      u.nama.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.namaUsaha || "").toLowerCase().includes(q);

    const st = authService.getSubscriptionStatus(u);
    const matchesStatus = !statusFilter || st === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const handleOpenStatusModal = (u: User) => {
    const currentSt = authService.getSubscriptionStatus(u);
    setStatusModalUser(u);
    setNewStatus(
      currentSt === "active" ? "active" : currentSt === "expired" ? "expired" : "trial"
    );
    setNewPlan(u.plan || "pkg_trial");
  };

  const handleSaveStatus = async () => {
    if (!statusModalUser) return;
    try {
      await settingsService.adminUpdateUserStatus(
        statusModalUser.id,
        newStatus,
        newPlan
      );
      await loadData();
      setStatusModalUser(null);
      showToast(`Status ${statusModalUser.nama} berhasil diperbarui.`, "success");
    } catch {
      showToast("Gagal memperbarui status pengguna.", "error");
    }
  };

  const handleDeleteUser = (u: User) => {
    showConfirm(
      "Hapus pengguna?",
      `Akun ${u.nama} beserta seluruh transaksinya akan dihapus permanen.`,
      async () => {
        await settingsService.adminDeleteUser(u.id);
        await loadData();
        showToast("Pengguna berhasil dihapus.", "success");
      },
      "Ya, Hapus",
      true
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat data pengguna...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Kelola akun pengguna, status langganan, dan akses aplikasi.
      </p>

      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama, email, atau usaha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
          >
            <option value="">Semua Status</option>
            <option value="trial">Trial</option>
            <option value="active">Aktif</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] min-w-[720px]">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Pengguna
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Usaha
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Status
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Paket
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Transaksi
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Terdaftar
                </th>
                <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const st = authService.getSubscriptionStatus(u);
                  const pkgName =
                    packages.find((p) => p.id === u.plan)?.nama || "—";
                  const txCount = allTransactions.filter(
                    (t) => t.userId === u.id
                  ).length;

                  return (
                    <tr key={u.id} className="hover:bg-bg-app/40 transition-colors">
                      <td className="py-3">
                        <b className="text-[#111111] block">{u.nama}</b>
                        <small className="text-brand-muted text-xs">{u.email}</small>
                      </td>
                      <td className="py-3">
                        <span className="text-[#111111] block font-medium">
                          {u.namaUsaha || "-"}
                        </span>
                        <small className="text-brand-muted text-xs">
                          {u.jenisUsaha || ""}
                        </small>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block text-[11px] font-semibold py-0.5 px-2.5 rounded-full ${
                            st === "active"
                              ? "bg-[#E7F4EA] text-brand-green"
                              : st === "trial"
                              ? "bg-[#FDF3DA] text-[#8a6300]"
                              : "bg-[#FBEBEA] text-brand-red"
                          }`}
                        >
                          {st === "trial" ? "Trial" : st === "active" ? "Aktif" : "Expired"}
                        </span>
                      </td>
                      <td className="py-3 text-[#111111]">{pkgName}</td>
                      <td className="py-3 text-right font-medium text-[#111111]">
                        {txCount}
                      </td>
                      <td className="py-3 text-brand-muted text-xs">
                        {fmtDate(String(u.createdAt || "").slice(0, 10))}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailUser(u)}
                            className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(u)}
                            className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                          >
                            Ubah Status
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            title="Hapus pengguna"
                            className="w-7 h-7 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red text-[#111111] grid place-items-center transition-all"
                          >
                            <Icon name="trash" size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-brand-muted">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {detailUser && (
        <Modal
          isOpen={Boolean(detailUser)}
          onClose={() => setDetailUser(null)}
          title={detailUser.nama}
        >
          {(() => {
            const st = authService.getSubscriptionStatus(detailUser);
            const userTxs = allTransactions.filter((t) => t.userId === detailUser.id);
            const stats = totals(userTxs);
            const pkgName =
              packages.find((p) => p.id === detailUser.plan)?.nama || "—";

            return (
              <div className="divide-y divide-brand-line text-sm mt-3">
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Email</b>
                  <span className="font-semibold text-[#111111]">{detailUser.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Status</b>
                  <span
                    className={`inline-block text-xs font-semibold py-0.5 px-2 rounded-full ${
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
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Paket</b>
                  <span className="font-semibold text-[#111111]">{pkgName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Trial Berakhir</b>
                  <span className="font-semibold text-[#111111]">
                    {fmtDate(detailUser.trialEnd.slice(0, 10))}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Nama Usaha</b>
                  <span className="font-semibold text-[#111111]">
                    {detailUser.namaUsaha || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Jenis Usaha</b>
                  <span className="font-semibold text-[#111111]">
                    {detailUser.jenisUsaha || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Total Transaksi</b>
                  <span className="font-semibold text-[#111111]">{stats.count}</span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Pemasukan</b>
                  <span className="font-semibold text-brand-green">
                    {rp(stats.masuk)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Pengeluaran</b>
                  <span className="font-semibold text-brand-red">
                    {rp(stats.keluar)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <b className="text-brand-muted">Laba / Rugi</b>
                  <span
                    className={`font-semibold ${
                      stats.saldo >= 0 ? "text-brand-green" : "text-brand-red"
                    }`}
                  >
                    {(stats.saldo < 0 ? "− " : "") + rp(stats.saldo)}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setDetailUser(null)}
              className="px-5 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Tutup
            </button>
          </div>
        </Modal>
      )}

      {/* Change Status Modal */}
      {statusModalUser && (
        <Modal
          isOpen={Boolean(statusModalUser)}
          onClose={() => setStatusModalUser(null)}
          title="Ubah Status Langganan"
        >
          <p className="text-brand-muted text-xs -mt-1 mb-4">
            {statusModalUser.nama} — {statusModalUser.email}
          </p>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "trial" | "active" | "expired")
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
              >
                <option value="trial">Trial</option>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Paket
              </label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end mt-6">
            <button
              type="button"
              onClick={() => setStatusModalUser(null)}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
            >
              Simpan
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
