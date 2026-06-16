"use server";

import { getDb } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export interface SystemSettings {
  otp_delay: string;
  otp_sandbox: string;
  otp_whatsapp_provider: string;
  otp_api_url: string;
  otp_api_key: string;
  otp_template: string;
}

/**
 * Retrieves all configuration settings from the SQLite database.
 */
export async function getSettings(): Promise<SystemSettings> {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM settings").all() as { key: string; value: string }[];
    
    const settings: SystemSettings = {
      otp_delay: "0",
      otp_sandbox: "true",
      otp_whatsapp_provider: "Fonnte / Wablas",
      otp_api_url: "https://api.fonnte.com/send",
      otp_api_key: "dummy_whatsapp_api_key_abcdefghijklmnopqrstuvwxyz",
      otp_template: "Halo {{username}}, kode OTP keamanan Anda adalah {{otp}}. Kode berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.",
    };

    rows.forEach((row) => {
      if (row.key in settings) {
        settings[row.key as keyof SystemSettings] = row.value;
      }
    });

    return settings;
  } catch (error: any) {
    logEvent("ERROR", "Gagal mengambil konfigurasi pengaturan dari SQLite", { error: error.message });
    return {
      otp_delay: "0",
      otp_sandbox: "true",
      otp_whatsapp_provider: "Dummy",
      otp_api_url: "",
      otp_api_key: "",
      otp_template: "",
    };
  }
}

/**
 * Saves or updates settings keys in the SQLite database.
 */
export async function saveSettings(
  data: SystemSettings
): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", "Memproses penyimpanan konfigurasi sistem baru", { 
    provider: data.otp_whatsapp_provider, 
    sandbox: data.otp_sandbox,
    delay: data.otp_delay 
  });

  try {
    const db = getDb();
    const now = new Date().toISOString();

    const insertSetting = db.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    );

    Object.entries(data).forEach(([key, value]) => {
      insertSetting.run(key, value);
    });

    // Log the configuration modification
    const insertActivity = db.prepare(
      "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertActivity.run(null, "Sistem", "Konfigurasi WhatsApp Gateway (WAG) diperbarui oleh admin", "Success", now);

    logEvent("INFO", "Konfigurasi sistem berhasil disimpan ke SQLite");

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    
    return { success: true, message: "Pengaturan integrasi berhasil disimpan." };
  } catch (error: any) {
    logEvent("ERROR", "Gagal menyimpan konfigurasi sistem ke SQLite", { error: error.message });
    return { success: false, message: `Gagal menyimpan: ${error.message || "Error database"}` };
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  logEvent("INFO", "Memulai pengujian konektivitas API WhatsApp Gateway (Simulasi)...");
  
  try {
    // Simulating an API ping to the Whatsapp API provider
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    logEvent("INFO", "Pengujian konektivitas API WhatsApp Gateway berhasil (Status: Online/200 OK)");
    return {
      success: true,
      message: "Koneksi ke gateway provider berhasil! (Status: Online/200 OK)",
    };
  } catch (error: any) {
    logEvent("ERROR", "Pengujian konektivitas API WhatsApp Gateway gagal", { error: error.message });
    return {
      success: false,
      message: `Gagal uji konektivitas: ${error.message}`,
    };
  }
}
