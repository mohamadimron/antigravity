"use server";

import { getDb } from "@/lib/db";
import { setSession, deleteSession } from "@/lib/session";
import { logEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export interface AuthState {
  success: boolean;
  message: string;
  step: "request" | "verify";
  username?: string;
  phone?: string;
}

/**
 * Handles sending a dummy WhatsApp OTP to the user.
 * Seeds an activity entry in the database.
 */
export async function requestOtp(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const username = formData.get("username")?.toString().trim();
  let phone = formData.get("phone")?.toString().trim();

  logEvent("INFO", "Menerima permintaan OTP baru", { username, phone });

  if (!username || !phone) {
    logEvent("WARN", "Permintaan OTP ditolak: username atau phone kosong");
    return {
      success: false,
      message: "Username dan Nomor HP wajib diisi.",
      step: "request",
    };
  }

  // Basic validation
  if (username.length < 3) {
    logEvent("WARN", `Permintaan OTP ditolak: username '${username}' terlalu pendek`);
    return {
      success: false,
      message: "Username harus memiliki minimal 3 karakter.",
      step: "request",
    };
  }

  if (phone.length < 8) {
    logEvent("WARN", `Permintaan OTP ditolak: nomor HP '${phone}' tidak valid`);
    return {
      success: false,
      message: "Nomor HP tidak valid. Masukkan minimal 8 digit.",
      step: "request",
    };
  }

  // Normalize Indonesian phone number format
  if (phone.startsWith("0")) {
    phone = "+62" + phone.slice(1);
  } else if (!phone.startsWith("+")) {
    phone = "+" + phone;
  }

  try {
    const db = getDb();
    
    // Fetch settings for log description
    const settingsRows = db.prepare("SELECT * FROM settings").all() as { key: string; value: string }[];
    const settingsMap = new Map(settingsRows.map((r) => [r.key, r.value]));
    const isSandbox = settingsMap.get("otp_sandbox") === "true";
    const provider = settingsMap.get("otp_whatsapp_provider") || "Dummy";
    const delaySec = Number(settingsMap.get("otp_delay") || "0");

    // Simulate sending delay if configured
    if (delaySec > 0) {
      logEvent("INFO", `Mensimulasikan delay pengiriman OTP selama ${delaySec} detik`);
      await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
    }
    
    const now = new Date().toISOString();
    
    // Log OTP request activity
    const insertActivity = db.prepare(
      "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertActivity.run(
      null, 
      username, 
      `OTP diminta ke ${phone} via ${provider} (${isSandbox ? "Sandbox" : "Production"})`, 
      "Success", 
      now
    );

    logEvent("INFO", `Simulasi OTP WhatsApp terkirim ke ${phone} (OTP: 123456)`);

    return {
      success: true,
      message: `OTP dummy telah dikirim ke WhatsApp ${phone}. Gunakan kode 123456.`,
      step: "verify",
      username,
      phone,
    };
  } catch (error: any) {
    logEvent("ERROR", "Kesalahan sistem saat request OTP", { error: error.message });
    return {
      success: false,
      message: `Gagal mengirim OTP: ${error.message || "Kesalahan sistem"}`,
      step: "request",
    };
  }
}

/**
 * Verifies the 6-digit WhatsApp OTP.
 * Registers user if they don't exist yet, sets cookies session, and logs activity.
 */
export async function verifyOtp(
  username: string,
  phone: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", "Mencoba memverifikasi kode OTP", { username, phone, otp });

  if (!username || !phone || !otp) {
    logEvent("WARN", "Verifikasi OTP gagal: Parameter tidak lengkap.");
    return { success: false, message: "Parameter verifikasi tidak lengkap." };
  }

  if (otp !== "123456") {
    logEvent("WARN", `Kode OTP salah dimasukkan untuk user ${username}`, { phone, inputOtp: otp });
    try {
      const db = getDb();
      const now = new Date().toISOString();
      const insertActivity = db.prepare(
        "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      insertActivity.run(null, username, `Verifikasi OTP gagal untuk ${phone} (OTP salah: ${otp})`, "Failed", now);
    } catch (e) {}
    
    return {
      success: false,
      message: "Kode OTP salah. Silakan masukkan kode statis '123456'.",
    };
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();

    // Check if user already exists
    let user = db.prepare("SELECT * FROM users WHERE username = ? OR phone = ?").get(username, phone) as {
      id: number;
      username: string;
      phone: string;
      role: string;
      status: string;
      joined_at: string;
    } | undefined;

    if (!user) {
      logEvent("INFO", `User baru terdeteksi. Melakukan registrasi otomatis untuk ${username}`, { phone });
      
      // Create user automatically (Registration on the fly)
      const insertUser = db.prepare(
        "INSERT INTO users (username, phone, role, status, joined_at) VALUES (?, ?, ?, ?, ?)"
      );
      const result = insertUser.run(username, phone, "User", "Active", now);
      
      user = {
        id: Number(result.lastInsertRowid),
        username,
        phone,
        role: "User",
        status: "Active",
        joined_at: now,
      };

      // Log registration activity
      const insertActivity = db.prepare(
        "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      insertActivity.run(user.id, username, "Pendaftaran otomatis pengguna baru via WhatsApp OTP", "Success", now);
      
      logEvent("INFO", `Registrasi otomatis berhasil untuk ${username}`, { userId: user.id });
    } else {
      // Validate user status
      if (user.status !== "Active") {
        logEvent("WARN", `Upaya masuk diblokir: Status akun ${username} tidak aktif`);
        const insertActivity = db.prepare(
          "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
        );
        insertActivity.run(user.id, username, "Login diblokir karena status tidak aktif", "Failed", now);
        
        return {
          success: false,
          message: "Akun Anda dinonaktifkan oleh admin. Hubungi CS untuk info lanjut.",
        };
      }

      // Log successful login
      const insertActivity = db.prepare(
        "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      insertActivity.run(user.id, username, "Login berhasil via WhatsApp OTP", "Success", now);
    }

    // Write session cookies
    await setSession({
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role,
    });

    logEvent("INFO", `Login sukses. Sesi berhasil dibuat untuk user: ${username}`, { userId: user.id });

    return {
      success: true,
      message: "Login berhasil! Sedang dialihkan...",
    };
  } catch (error: any) {
    logEvent("ERROR", "Kesalahan sistem saat verifikasi OTP", { error: error.message });
    return {
      success: false,
      message: `Gagal memverifikasi OTP: ${error.message || "Kesalahan sistem"}`,
    };
  }
}

/**
 * Performs user logout.
 */
export async function logoutUser(): Promise<void> {
  logEvent("INFO", "Proses logout pengguna dipanggil");
  await deleteSession();
  revalidatePath("/");
}
