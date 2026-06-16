"use server";

import { getDb } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export interface User {
  id: number;
  username: string;
  phone: string;
  role: string;
  status: string;
  joined_at: string;
}

/**
 * Fetch all users from database ordered by ID descending.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const db = getDb();
    return db.prepare("SELECT * FROM users ORDER BY id DESC").all() as User[];
  } catch (error: any) {
    logEvent("ERROR", "Gagal mengambil daftar pengguna dari database SQLite", { error: error.message });
    return [];
  }
}

/**
 * Creates a new user in the SQLite database.
 * Validates unique constraints (username, phone) and logs the action.
 */
export async function createUser(
  username: string,
  phone: string,
  role: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", `Memulai pembuatan pengguna baru: ${username}`, { role, status });

  if (!username || !phone) {
    logEvent("WARN", "Gagal membuat pengguna: Username atau Nomor HP kosong");
    return { success: false, message: "Username dan Nomor HP wajib diisi." };
  }

  // Normalize phone number
  let normalizedPhone = phone.trim();
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "+62" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("+")) {
    normalizedPhone = "+" + normalizedPhone;
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();

    // Check duplicate
    const exists = db
      .prepare("SELECT id FROM users WHERE username = ? OR phone = ?")
      .get(username.trim(), normalizedPhone);

    if (exists) {
      logEvent("WARN", `Gagal membuat pengguna: Username '${username}' atau phone '${normalizedPhone}' sudah terdaftar`);
      return { success: false, message: "Username atau nomor HP sudah terdaftar." };
    }

    const insert = db.prepare(
      "INSERT INTO users (username, phone, role, status, joined_at) VALUES (?, ?, ?, ?, ?)"
    );
    insert.run(username.trim(), normalizedPhone, role, status, now);

    // Log the user addition in activities log
    const insertActivity = db.prepare(
      "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertActivity.run(
      null, 
      "Sistem", 
      `Pengguna baru didaftarkan oleh admin: ${username.trim()} (${role})`, 
      "Success", 
      now
    );

    logEvent("INFO", `Pengguna baru '${username}' berhasil ditambahkan ke SQLite`, { role, phone: normalizedPhone });

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");
    return { success: true, message: "Pengguna berhasil ditambahkan." };
  } catch (error: any) {
    logEvent("ERROR", `Kesalahan saat membuat pengguna '${username}'`, { error: error.message });
    return { success: false, message: `Gagal menambahkan pengguna: ${error.message || "Error database"}` };
  }
}

/**
 * Updates an existing user in the database.
 */
export async function updateUser(
  id: number,
  username: string,
  phone: string,
  role: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", `Memulai pembaruan pengguna ID: ${id}`, { username, role, status });

  if (!username || !phone) {
    logEvent("WARN", "Gagal memperbarui pengguna: Username atau Nomor HP kosong");
    return { success: false, message: "Username dan Nomor HP wajib diisi." };
  }

  let normalizedPhone = phone.trim();
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "+62" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("+")) {
    normalizedPhone = "+" + normalizedPhone;
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();

    // Check duplicate (exclude current user ID)
    const exists = db
      .prepare("SELECT id FROM users WHERE (username = ? OR phone = ?) AND id != ?")
      .get(username.trim(), normalizedPhone, id);

    if (exists) {
      logEvent("WARN", `Gagal memperbarui pengguna: Username '${username}' atau phone '${normalizedPhone}' bentrok dengan user lain`);
      return { success: false, message: "Username atau nomor HP sudah terdaftar di pengguna lain." };
    }

    const update = db.prepare(
      "UPDATE users SET username = ?, phone = ?, role = ?, status = ? WHERE id = ?"
    );
    update.run(username.trim(), normalizedPhone, role, status, id);

    // Log the edit
    const insertActivity = db.prepare(
      "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertActivity.run(
      id, 
      "Sistem", 
      `Profil pengguna '${username.trim()}' diperbarui oleh admin`, 
      "Success", 
      now
    );

    logEvent("INFO", `Pengguna ID: ${id} ('${username}') berhasil diperbarui di SQLite`);

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");
    return { success: true, message: "Pengguna berhasil diperbarui." };
  } catch (error: any) {
    logEvent("ERROR", `Kesalahan saat memperbarui pengguna ID: ${id}`, { error: error.message });
    return { success: false, message: `Gagal memperbarui pengguna: ${error.message || "Error database"}` };
  }
}

/**
 * Deletes a user by ID.
 */
export async function deleteUser(id: number): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", `Memulai proses penghapusan pengguna ID: ${id}`);

  try {
    const db = getDb();
    const now = new Date().toISOString();

    const user = db.prepare("SELECT username FROM users WHERE id = ?").get(id) as { username: string } | undefined;
    if (!user) {
      logEvent("WARN", `Gagal menghapus: Pengguna dengan ID ${id} tidak ditemukan`);
      return { success: false, message: "Pengguna tidak ditemukan." };
    }

    // Protection for admin
    if (user.username === "admin") {
      logEvent("WARN", "Penolakan keamanan: Upaya menghapus pengguna bawaan 'admin'");
      return { success: false, message: "Pengguna bawaan 'admin' tidak dapat dihapus." };
    }

    const deleteStmt = db.prepare("DELETE FROM users WHERE id = ?");
    deleteStmt.run(id);

    // Log deletion
    const insertActivity = db.prepare(
      "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertActivity.run(
      null, 
      "Sistem", 
      `Menghapus akun pengguna: ${user.username}`, 
      "Success", 
      now
    );

    logEvent("INFO", `Pengguna '${user.username}' (ID: ${id}) berhasil dihapus dari SQLite`);

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");
    return { success: true, message: "Pengguna berhasil dihapus." };
  } catch (error: any) {
    logEvent("ERROR", `Kesalahan saat menghapus pengguna ID: ${id}`, { error: error.message });
    return { success: false, message: `Gagal menghapus pengguna: ${error.message || "Error database"}` };
  }
}
