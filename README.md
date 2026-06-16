# 📱 Dashboard Admin - WhatsApp OTP Gateway & User Manager

Aplikasi web Dashboard Admin modern, responsif, dan mobile-friendly yang dibangun menggunakan **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **SQLite**. 

Aplikasi ini mengimplementasikan alur masuk tanpa kata sandi (Passwordless OTP) dengan simulasi OTP WhatsApp statis (`123456`) untuk verifikasi identitas, pencatatan log aktivitas, manajemen data pengguna (CRUD), dan konfigurasi gateway untuk integrasi WhatsApp API asli pada tahap berikutnya.

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Logika**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Desain & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Gaya SaaS Minimalis & Glassmorphism)
- **Database**: [SQLite 3](https://sqlite.org/) (Menggunakan engine berkinerja tinggi `better-sqlite3` dengan WAL Mode)
- **Ikonografi**: [Lucide React](https://lucide.dev/)

---

## 📂 Struktur Folder (Clean Architecture)

Proyek ini terstruktur rapi dengan pemisahan tanggung jawab yang jelas:

```text
src/
├── app/
│   ├── actions/          # Server Actions untuk komunikasi aman langsung ke SQLite
│   │   ├── auth.ts       # Logika masuk/keluar, OTP generator, auto-registrasi
│   │   ├── dashboard.ts  # Agregasi data statistik & log aktivitas terbaru
│   │   ├── settings.ts   # CRUD konfigurasi WhatsApp Gateway (WAG)
│   │   └── users.ts      # CRUD manajemen akun pengguna
│   ├── components/       # Reusable Client Components (modals, charts, forms)
│   │   ├── DashboardCharts.tsx       # Grafik SVG interaktif dengan gradient & tooltips
│   │   ├── DashboardLayoutShell.tsx  # Shell layout responsif (sidebar desktop & mobile drawer)
│   │   ├── LoginForm.tsx            # Form login dinamis dengan validasi nomor HP
│   │   ├── SettingsForm.tsx         # Panel pengaturan API & spesifikasi SQLite
│   │   └── UserManagement.tsx       # Modals dan tabel CRUD user
│   ├── dashboard/        # Rute terproteksi Dashboard (Dashboard, Users, Settings)
│   │   ├── layout.tsx    # Pembungkus layout dashboard & validasi sesi server
│   │   ├── page.tsx      # Ringkasan statistik & log transaksi
│   │   ├── settings/     # Rute pengaturan gateway
│   │   └── users/        # Rute manajemen user
│   ├── favicon.ico
│   ├── globals.css       # Konfigurasi Tailwind v4, scrollbars, & keyframe micro-animations
│   ├── layout.tsx        # Root layout HTML5
│   └── page.tsx          # Portal masuk utama (Login)
├── lib/
│   ├── db.ts             # Koneksi & migrasi database SQLite (seeding otomatis data dummy)
│   └── session.ts        # Enkripsi & manajemen cookie sesi server (HTTP-only)
├── middleware.ts         # Route guard (Mencegah akses ilegal ke dashboard)
database.sqlite           # Berkas database SQLite lokal (dibuat otomatis)
```

---

## 🔐 Panduan Masuk Simulasi OTP (Demo Mode)

Aplikasi menyertakan data bawaan untuk demo. Anda dapat login menggunakan kredensial berikut:

1. **Username**: `admin` (atau ketik nama bebas apa saja untuk mendaftar otomatis)
2. **Nomor HP**: `081234567890` (atau nomor HP bebas dengan format Indonesia)
3. **Kode OTP WhatsApp**: Masukkan kode statis **`123456`**.

*Setelah masuk pertama kali dengan nomor baru, sistem secara otomatis melakukan registrasi on-the-fly dengan role default `User` dan menyimpannya ke database SQLite.*

---

## 🚀 Cara Menjalankan Aplikasi

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Mode Pengembangan (Development)**:
   ```bash
   npm run dev
   ```
   Akses di browser: [http://localhost:3000](http://localhost:3000)

3. **Membangun Bundle Produksi (Build & Start)**:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 Integrasi WhatsApp Gateway Asli (Tahap Berikutnya)

Untuk mengaktifkan pengiriman OTP asli ke WhatsApp pengguna menggunakan penyedia (seperti **Fonnte** atau **Wablas**), Anda hanya perlu memodifikasi file [auth.ts](file:///home/imran/Documents/webtest/src/app/actions/auth.ts#L43-L70).

### Contoh Kode Integrasi Fonnte API:
```typescript
// Ganti blok simulasi di requestOtp (src/app/actions/auth.ts) dengan ini:
const response = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Authorization": apiKey // token dari pengaturan
  },
  body: new URLSearchParams({
    target: phone,
    message: `Halo ${username}, kode OTP keamanan Anda adalah ${otpCode}. Berlaku 5 menit.`,
    delay: "2",
    countryCode: "62"
  })
});

const result = await response.json();
if (result.status) {
  // Pengiriman WhatsApp berhasil
}
```

Semua parameter di atas (`apiUrl`, `apiKey`, `template`) sudah terpetakan secara dinamis ke halaman **Settings** di admin panel dan tersimpan langsung dalam tabel `settings` SQLite.

---

## 💾 Desain Skema Database SQLite

Migrasi dan seeding berjalan otomatis saat aplikasi dijalankan pertama kali.

### 1. Tabel `users`
Menampung kredensial pengguna terdaftar.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `username`: TEXT UNIQUE
- `phone`: TEXT UNIQUE
- `role`: TEXT (Admin / Staff / User)
- `status`: TEXT (Active / Inactive)
- `joined_at`: TEXT (ISO Date)

### 2. Tabel `activities`
Audit trail untuk mencatat login, pendaftaran baru, pengubahan konfigurasi, dan request OTP.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id`: INTEGER (NULL untuk guest)
- `username`: TEXT
- `activity`: TEXT
- `status`: TEXT (Success / Pending / Failed)
- `created_at`: TEXT (ISO Date)

### 3. Tabel `settings`
Menyimpan variabel konfigurasi WhatsApp Gateway.
- `key`: TEXT PRIMARY KEY
- `value`: TEXT
