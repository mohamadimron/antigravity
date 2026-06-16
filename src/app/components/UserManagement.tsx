"use client";

import React, { useState, useTransition } from "react";
import { createUser, updateUser, deleteUser, User } from "@/app/actions/users";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  Filter, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Phone,
  UserCheck
} from "lucide-react";

interface UserManagementProps {
  initialUsers: User[];
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal control states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("User");
  const [status, setStatus] = useState("Active");

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter users based on search & role
  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Open modals
  const openAddModal = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUsername("");
    setPhone("");
    setRole("User");
    setStatus("Active");
    setAddModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedUser(u);
    setUsername(u.username);
    setPhone(u.phone);
    setRole(u.role);
    setStatus(u.status);
    setEditModalOpen(true);
  };

  const openDeleteModal = (u: User) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedUser(u);
    setDeleteModalOpen(true);
  };

  // Action Submissions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await createUser(username, phone, role, status);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setAddModalOpen(false), 800);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await updateUser(selectedUser.id, username, phone, role, status);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setEditModalOpen(false), 800);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await deleteUser(selectedUser.id);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setDeleteModalOpen(false), 800);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const formatIndoDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return isoString;
    }
  };

  // Helper: Role badge styling
  const getRoleBadge = (r: string) => {
    if (r === "Admin") return "text-blue-600 bg-blue-500/10 dark:text-blue-400 border border-blue-500/10";
    if (r === "Staff") return "text-purple-600 bg-purple-500/10 dark:text-purple-400 border border-purple-500/10";
    return "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60";
  };

  // Helper: Status badge styling
  const getStatusBadge = (s: string) => {
    if (s === "Active") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10";
  };

  // Shared alert component
  const AlertFeedback = () => (
    <>
      {errorMsg && (
        <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-750 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 md:p-5 rounded-2xl shadow-sm">
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-3.5 flex-1 max-w-2xl">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan username atau nomor HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 md:py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-xs min-h-[44px]"
            />
          </div>

          {/* Role select filter */}
          <div className="relative min-w-[140px] flex items-center">
            <Filter className="absolute left-3.5 text-zinc-400 h-4 w-4 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-xs appearance-none cursor-pointer font-medium min-h-[44px]"
            >
              <option value="All">Semua Role</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        {/* Add User Button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer text-sm md:text-xs self-stretch sm:self-auto shrink-0 min-h-[44px]"
        >
          <Plus className="h-4.5 w-4.5 md:h-4 md:w-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* 2. Main Users — Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-150 dark:border-zinc-800/80">
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Nomor HP (WhatsApp)</th>
                <th className="px-6 py-4">Role / Jabatan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Tanggal Bergabung</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
                    Tidak ditemukan pengguna yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const badgeStyle = getStatusBadge(u.status);
                  const roleBadge = getRoleBadge(u.role);

                  return (
                    <tr 
                      key={u.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 uppercase shadow-inner">
                            {u.username[0]}
                          </div>
                          <div>
                            <span className="block text-zinc-900 dark:text-white font-bold">{u.username}</span>
                            <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">UID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-550 dark:text-zinc-300 font-mono font-semibold">
                        {u.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${badgeStyle}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400 dark:text-zinc-500">
                        {formatIndoDate(u.joined_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/20 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(u)}
                            disabled={u.username === "admin"} // Protect default admin
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-550 hover:text-red-500 hover:border-red-500/20 disabled:opacity-40 disabled:hover:text-zinc-400 disabled:hover:border-transparent transition-colors cursor-pointer"
                            title={u.username === "admin" ? "Admin bawaan tidak dapat dihapus" : "Hapus User"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2b. Mobile Card View (visible only on < md) */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              Tidak ditemukan pengguna yang cocok dengan filter.
            </p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const badgeStyle = getStatusBadge(u.status);
            const roleBadge = getRoleBadge(u.role);

            return (
              <div
                key={u.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in"
              >
                {/* Card Top: Avatar + Info + Badges */}
                <div className="p-4 flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className="h-11 w-11 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center font-bold text-base text-zinc-600 dark:text-zinc-300 uppercase shrink-0 shadow-inner">
                    {u.username[0]}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {u.username}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${roleBadge}`}>
                        {u.role}
                      </span>
                    </div>
                    <span className="block text-[11px] text-zinc-400 font-semibold mt-0.5">
                      UID: {u.id}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badgeStyle}`}>
                    {u.status}
                  </span>
                </div>

                {/* Card Bottom: Phone + Actions */}
                <div className="px-4 pb-4 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                  {/* Phone Number */}
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 min-w-0">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="text-xs font-mono font-semibold truncate">{u.phone}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/20 active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(u)}
                      disabled={u.username === "admin"}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-550 hover:text-red-500 hover:border-red-500/20 disabled:opacity-40 disabled:hover:text-zinc-400 disabled:hover:border-transparent active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title={u.username === "admin" ? "Admin bawaan tidak dapat dihapus" : "Hapus User"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setAddModalOpen(false)}></div>
          <div className="bg-white dark:bg-zinc-900 border-t md:border border-zinc-200 dark:border-zinc-800 w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-slide-from-bottom md:animate-scale-up max-h-[92vh] md:max-h-none overflow-y-auto">
            
            {/* Modal Header */}
            <div className="px-5 md:px-6 py-4 md:py-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30 sticky top-0 z-10">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-4.5 w-4.5 md:h-4 md:w-4 text-emerald-500" />
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                disabled={isPending}
                className="p-2 md:p-1 rounded-xl md:rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              >
                <X className="h-5 w-5 md:h-4 md:w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="p-5 md:p-6 space-y-4 md:space-y-4">
              
              <AlertFeedback />

              {/* Username Input */}
              <div>
                <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik username baru"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))} // No spaces
                  disabled={isPending}
                  className="w-full px-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs min-h-[44px]"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    disabled={isPending}
                    className="w-full pl-9 pr-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs min-h-[44px]"
                  />
                </div>
              </div>

              {/* Double row for Role and Status */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                    Role / Jabatan
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isPending}
                    className="w-full px-3 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs cursor-pointer min-h-[44px]"
                  >
                    <option value="User">User</option>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isPending}
                    className="w-full px-3 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs cursor-pointer min-h-[44px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-3 md:py-2.5 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-300 font-semibold rounded-xl text-sm md:text-xs cursor-pointer transition-colors min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-3 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm md:text-xs cursor-pointer shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 md:h-3 md:w-3 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Tambah Pengguna"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setEditModalOpen(false)}></div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="px-5 md:px-6 py-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30 sticky top-0 z-10">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Edit className="h-4.5 w-4.5 md:h-4 md:w-4 text-emerald-500" />
                Edit Pengguna
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={isPending}
                className="p-2 md:p-1 rounded-xl md:rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              >
                <X className="h-5 w-5 md:h-4 md:w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} className="p-5 md:p-6 space-y-4">
              
              <AlertFeedback />

              {/* Username Input (Disabled for default admin, editable otherwise) */}
              <div>
                <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                  disabled={isPending || selectedUser.username === "admin"}
                  className="w-full px-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs disabled:opacity-55 min-h-[44px]"
                />
              </div>

              {/* Phone Input (Disabled for admin, editable otherwise) */}
              <div>
                <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: +628123..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    disabled={isPending || selectedUser.username === "admin"}
                    className="w-full pl-9 pr-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs disabled:opacity-55 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Double row for Role and Status */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                    Role / Jabatan
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isPending || selectedUser.username === "admin"} // Admin cannot demote themselves
                    className="w-full px-3 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs cursor-pointer disabled:opacity-55 min-h-[44px]"
                  >
                    <option value="User">User</option>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 md:mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isPending || selectedUser.username === "admin"} // Admin cannot deactivate themselves
                    className="w-full px-3 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs cursor-pointer disabled:opacity-55 min-h-[44px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-3 md:py-2.5 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-300 font-semibold rounded-xl text-sm md:text-xs cursor-pointer transition-colors min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-3 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm md:text-xs cursor-pointer shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 md:h-3 md:w-3 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete User Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setDeleteModalOpen(false)}></div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-scale-up">
            
            {/* Modal Content */}
            <div className="p-6 md:p-6 text-center">
              {/* Close button on mobile */}
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isPending}
                className="md:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="h-14 w-14 md:h-12 md:w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 md:h-6 md:w-6" />
              </div>
              
              <h3 className="text-base md:text-sm font-bold text-zinc-900 dark:text-white">
                Hapus Akun Pengguna?
              </h3>
              
              <p className="text-sm md:text-xs text-zinc-400 dark:text-zinc-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong className="text-zinc-900 dark:text-zinc-200 font-bold">{selectedUser.username}</strong> ({selectedUser.phone})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>

              <AlertFeedback />

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isPending}
                  className="w-full sm:flex-1 px-4 py-3 md:py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-300 font-semibold rounded-xl text-sm md:text-xs cursor-pointer transition-colors min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isPending}
                  className="w-full sm:flex-1 px-4 py-3 md:py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm md:text-xs cursor-pointer shadow-lg shadow-red-500/15 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 md:h-3 md:w-3 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus Akun"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
