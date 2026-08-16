<div align="center">
  <img src="https://img.icons8.com/color/96/000000/laptop-settings--v1.png" alt="nuNox_servis Logo" />
  <h1>nuNox_servis</h1>
  <p><strong>Aplikasi Manajemen Kasir & CRM Usaha Servis Komputer/Laptop 100% Offline</strong></p>
  
  <p>
    <a href="https://github.com/Nuno-Hadianto/nuNox_servis/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    </a>
    <img src="https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white" alt="Electron">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D16.0.0-43853D?style=flat&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white" alt="SQLite">
    <img src="https://img.shields.io/badge/Playwright-Tested-2EAD33?style=flat&logo=playwright&logoColor=white" alt="Playwright">
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
- 📊 **Dashboard Analitik**: Pantau jumlah tiket aktif, grafik omset bulanan, dan margin keuntungan secara langsung.
- 👥 **Manajemen Pelanggan**: Pencatatan data pelanggan yang komprehensif, ditautkan dengan riwayat perangkat mereka.
- 🔧 **Tracking Servis**: Kelola tiket servis dari status *Masuk*, *Dikerjakan*, *Selesai*, hingga pembuatan *invoice* pembayaran (DP & Pelunasan).
- 📦 **Inventaris Sparepart**: Potongan stok barang otomatis apabila ditambahkan sebagai *item* servis di dalam tiket.
- 🖨️ **Kwitansi / Cetak Struk**: Tersedia fungsi cetak nota atau ekspor PDF dengan desain *Print-Ready* ukuran A4.
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
   Pastikan Anda sudah menginstal Node.js v16 atau versi yang lebih baru.
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi Mode Pengembangan**
   ```bash
   npm run dev
   ```

4. **Jalankan Uji Otomatis (E2E Tests)**
   Kami menggunakan *Playwright* untuk E2E testing alur bisnis kasir.
   ```bash
   npm run test:e2e
   ```

---

## 📦 Build Installer (.exe)
Jika Anda ingin mendistribusikan program ini menjadi aplikasi *Standalone* untuk sistem operasi Windows:
```bash
npm run build
```
File installer `nuNox_servis Setup.exe` akan di-generate oleh `electron-builder` dan tersimpan di dalam folder `dist/`.

---

## 📁 Struktur Direktori
Gambaran umum struktur direktori aplikasi:
```text
nuNox_servis/
├── __tests__/           # Skenario End-to-End Testing (Playwright)
├── controllers/         # Logika bisnis database SQLite (Backend)
├── database/            # Skema dan inisialisasi Database
├── electron/
│   ├── ipc/             # Handlers Inter-Process Communication (modular)
│   ├── main.js          # Entry point Electron (Main Process)
│   └── preload.js       # Context Bridge keamanan IPC
├── public/              # Aset statis (CSS, Fonts, JS Modular Frontend)
├── views/               # Tampilan UI HTML5
└── README.md
```

---

## 🛠️ Arsitektur Teknologi
- **Frontend**: Vanilla HTML5, CSS3 murni, dan ES6 JavaScript. Sangat ringan, tanpa *framework* berat (No React/Vue).
- **Backend (Main Process)**: Node.js dengan Electron API.
- **Database**: `better-sqlite3` yang dikonfigurasi untuk kecepatan maksimal (sinkron).
- **Security**: Autentikasi lokal terenkripsi (bcryptjs) & Proteksi Context-Isolation dari IPC Electron.

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
