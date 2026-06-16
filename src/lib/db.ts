import Database from "better-sqlite3";
import path from "path";
import { logEvent } from "./logger";

// Path to the SQLite database file in the root of the project
const DB_PATH = path.resolve(process.cwd(), "database.sqlite");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    logEvent("INFO", `Membuka koneksi ke database SQLite pada path: ${DB_PATH}`);
    dbInstance = new Database(DB_PATH);

    // Enable WAL mode for better performance
    dbInstance.pragma("journal_mode = WAL");
    logEvent("INFO", "Mode WAL diaktifkan untuk SQLite.");

    // Create tables if they do not exist
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        status TEXT NOT NULL DEFAULT 'Active',
        joined_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT NOT NULL,
        activity TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Success', 'Pending', 'Failed'
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    logEvent("INFO", "Inisialisasi skema tabel database SQLite berhasil.");

    // Seed initial data if the users table is empty
    const userCount = dbInstance.prepare("SELECT count(*) as count FROM users").get() as { count: number };
    if (userCount && userCount.count === 0) {
      logEvent("INFO", "Tabel 'users' kosong. Memulai seeding data bawaan...");
      const now = new Date().toISOString();

      // Insert dummy users
      const insertUser = dbInstance.prepare(
        "INSERT INTO users (username, phone, role, status, joined_at) VALUES (?, ?, ?, ?, ?)"
      );
      insertUser.run("admin", "+6281234567890", "Admin", "Active", now);
      insertUser.run("budisudono", "+6282345678901", "Staff", "Active", now);
      insertUser.run("sitinurhaliza", "+6283456789012", "Staff", "Active", now);
      insertUser.run("dewisartika", "+6284567890123", "User", "Inactive", now);

      // Insert dummy activities
      const insertActivity = dbInstance.prepare(
        "INSERT INTO activities (user_id, username, activity, status, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      insertActivity.run(1, "admin", "Login ke sistem berhasil", "Success", now);
      insertActivity.run(2, "budisudono", "Mengubah pengaturan profil", "Success", now);
      insertActivity.run(4, "dewisartika", "Mendaftarkan nomor HP baru", "Success", now);
      insertActivity.run(3, "sitinurhaliza", "Mencoba mengirim OTP ke +6283456789012", "Success", now);

      // Insert settings
      const insertSetting = dbInstance.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
      );
      insertSetting.run("otp_delay", "0");
      insertSetting.run("otp_sandbox", "true");
      insertSetting.run("otp_whatsapp_provider", "Wablas / Fonnte / Dummy");
      insertSetting.run("otp_api_url", "https://api.whatsapp-api-dummy.com/send");
      insertSetting.run("otp_api_key", "dummy_whatsapp_api_key_abcdefghijklmnopqrstuvwxyz");
      insertSetting.run("otp_template", "Halo {{username}}, kode OTP keamanan Anda adalah {{otp}}. Kode berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.");
      
      logEvent("INFO", "Seeding data bawaan (users, activities, settings) berhasil diselesaikan.");
    }
  } catch (error: any) {
    logEvent("ERROR", "Kesalahan fatal saat inisialisasi database SQLite", { error: error.message });
    throw error;
  }

  return dbInstance;
}
