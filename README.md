<div align="center">
  <img src="https://img.icons8.com/color/96/000000/laptop-settings--v1.png" alt="nuNox_servis Logo" />
  <h1>nuNox_servis</h1>
  <p><strong>Aplikasi Point of Sale (POS) & Manajemen Servis Komputer/Laptop 100% Offline</strong></p>
  
  <p>
    <a href="https://github.com/Nuno-Hadianto/nuNox_servis/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    </a>
    <img src="https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white" alt="Electron">
    <img src="https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E" alt="Vite">
    <img src="https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white" alt="SQLite">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  </p>
</div>

---

<details>
  <summary><strong>Daftar Isi</strong></summary>

- [📖 Tentang Aplikasi](#-tentang-aplikasi)
- [✨ Fitur Utama](#-fitur-utama)
- [📸 Tangkapan Layar (Screenshots)](#-tangkapan-layar-screenshots)
- [🚀 Cara Instalasi (Developer)](#-cara-instalasi-developer)
- [📦 Build Installer (.exe)](#-build-installer-exe)
- [📁 Struktur Direktori](#-struktur-direktori)
- [🛠️ Arsitektur Teknologi](#-arsitektur-teknologi)
- [🤝 Berkontribusi](#-berkontribusi)
- [📄 Lisensi](#-lisensi)

</details>

---

## 📖 Tentang Aplikasi
**nuNox_servis** adalah sistem kasir sekaligus *Customer Relationship Management* (CRM) khusus untuk teknisi atau pemilik usaha servis laptop/PC maupun barang elektronik lainnya. Dirancang agar berjalan **100% offline** (tanpa koneksi internet atau server *cloud*), memastikan seluruh data pelanggan, rekap servis, dan omset usaha tersimpan aman secara lokal di komputer Anda.

---

## ✨ Fitur Utama
- 📊 **Dashboard & Peringatan Otomatis**: Pantau jumlah tiket aktif, grafik omset bulanan, margin keuntungan, dan *sistem peringatan pintar* (menyorot barang servis yang belum diambil > 14 hari atau menunggu *sparepart* > 7 hari).
- 👥 **Manajemen Pelanggan terintegrasi WhatsApp**: Pencatatan data pelanggan komprehensif, dilengkapi tombol kirim notifikasi tagihan langsung ke WhatsApp Web.
- 🔧 **Tracking Servis Terperinci**: Kelola tiket servis dari status *Masuk*, *Dikerjakan*, *Selesai*, hingga pembuatan *invoice* pembayaran (DP & Pelunasan).
- 📦 **Inventaris & Sparepart Terlaris**: Potongan stok barang otomatis apabila ditambahkan ke tiket servis. Tersedia laporan analitik cerdas untuk 5 *sparepart* terlaris bulanan.
- 🖨️ **Laporan Keuangan Eksekutif**: Ekspor laporan keuangan bulanan super elegan dalam format PDF.
- 🔐 **Keamanan Internal**: Autentikasi Admin yang diamankan dengan *bcryptjs* hashing.
- 📂 **Backup & Restore**: Mengamankan (*backup*) dan memulihkan (*restore*) keseluruhan database SQLite dalam sekali klik.

---

## 📸 Tangkapan Layar (Screenshots)

> **Catatan:** Tambahkan gambar tangkapan layar asli aplikasi Anda di folder `docs/screenshots/` dan tautkan di sini.

| Halaman Dashboard | Halaman Detail Servis |
| :---: | :---: |
| ![Dashboard Preview](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Dashboard+Aplikasi) | ![Service Detail](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Detail+Tiket+Servis) |

---

## 🚀 Cara Instalasi (Developer)

1. **Clone repositori**
   ```bash
   git clone https://github.com/Nuno-Hadianto/nuNox_servis.git
   cd nuNox_servis
   ```

2. **Install Dependensi**
   Pastikan Anda sudah menginstal Node.js v18 atau versi yang lebih baru.
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi Mode Pengembangan**
   Karena kita menggunakan *Vite* dan *Electron* secara berdampingan, gunakan perintah:
   ```bash
   npm run dev:all
   ```

4. **Jalankan Uji Otomatis (E2E Tests)**
   ```bash
   npm run test:e2e
   ```

---

## 📦 Build Installer (.exe)
Untuk mendistribusikan program ini menjadi aplikasi *Standalone* untuk Windows:
```bash
npm run build
```
File installer akan di-generate oleh `electron-builder` dan tersimpan di dalam folder `dist/`.

---

## 📁 Struktur Direktori
Gambaran umum arsitektur kode modern kami:
```text
nuNox_servis/
├── controllers/         # Logika bisnis database SQLite (Backend)
├── database/            # Skema dan inisialisasi Database
├── electron/
│   ├── ipc/             # Handlers Inter-Process Communication (modular)
│   ├── main.js          # Entry point Electron (Main Process)
│   └── preload.js       # Context Bridge untuk jembatan keamanan IPC
├── repositories/        # Lapisan abstraksi kueri SQL
├── src/                 # 🌟 Wajah Aplikasi (Vue 3, Vite, TypeScript)
│   ├── components/      # Komponen antarmuka yang dapat digunakan kembali
│   ├── views/           # Halaman utama aplikasi (Dashboard, Laporan, dll)
│   ├── router/          # Rute pergerakan halaman (Vue Router)
│   └── App.vue          # Entry point aplikasi Vue
└── README.md
```

---

## 🛠️ Arsitektur Teknologi
- **Frontend (UI)**: **Vue 3** dengan *Composition API* (`<script setup lang="ts">`) dipadukan dengan **Vite** untuk kecepatan render kilat.
- **Backend (Otak)**: Node.js dengan **Electron API**.
- **Database**: `better-sqlite3` yang dikonfigurasi untuk performa sinkron tinggi 100% lokal.
- **Keamanan**: Autentikasi lokal terenkripsi (`bcryptjs`) & Proteksi *Context-Isolation* dari IPC Electron (sangat mustahil disusupi dari halaman frontend).

---

## 🤝 Berkontribusi
Kontribusi *Open Source* selalu terbuka! Silakan baca panduan lengkap di [CONTRIBUTING.md](CONTRIBUTING.md) sebelum mulai mengirimkan *Pull Request*. Jika Anda menemukan masalah (bug) atau ingin menyarankan fitur baru, laporkan melalui halaman *Issues*.

---

## 📄 Lisensi
Proyek ini didistribusikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.

---
<div align="center">
  Dibuat dengan 💻 untuk NUNOX_SERVIS.
</div>
