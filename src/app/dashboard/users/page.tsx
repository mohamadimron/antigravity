import React from "react";
import { getUsers } from "@/app/actions/users";
import UserManagement from "@/app/components/UserManagement";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Pengguna - Dashboard Admin OTP WhatsApp",
  description: "Kelola dan administrasi database pengguna SQLite. Cari, saring berdasarkan role, ubah status keaktifan, tambah baru, atau hapus pengguna.",
};

export default async function UsersPage() {
  // Fetch users on the server-side
  const users = await getUsers();

  return (
    <div className="space-y-6 animate-fade-in" id="user-management-page">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Manajemen Pengguna (Users)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kelola kredensial pengguna, role (Admin, Staff, User), status keaktifan akun, dan data kontak terdaftar.
        </p>
      </div>

      {/* Render Client Management Portal */}
      <UserManagement initialUsers={users} />
    </div>
  );
}
