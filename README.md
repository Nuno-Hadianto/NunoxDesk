<div align="center">
  <img src="https://img.icons8.com/color/96/000000/laptop-settings--v1.png" alt="NunoxDesk Logo" />
  <h1>NunoxDesk</h1>
  <p><strong>Aplikasi Manajemen Usaha Servis Komputer & Laptop 100% Offline</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS">
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  </p>
</div>

---

## 📖 Tentang Aplikasi
**NunoxDesk** adalah sistem kasir sekaligus *Customer Relationship Management* (CRM) khusus untuk teknisi atau pemilik usaha servis laptop/PC. Dirancang agar berjalan **100% offline** (tanpa koneksi internet atau server *cloud*), memastikan seluruh data pelanggan dan omset usaha tersimpan aman secara lokal di komputer Anda.

## ✨ Fitur Utama
- 📊 **Dashboard Analitik**: Pantau tiket aktif dan total omset dengan cepat.
- 👥 **Manajemen Pelanggan**: Kelola data pelanggan beserta perangkat yang mereka miliki.
- 🔧 **Tracking Servis**: Catat keluhan, riwayat teknisi, hingga pembuatan *invoice* otomatis (DP & Pelunasan).
- 📦 **Inventaris Sparepart**: Integrasi potongan stok otomatis saat sparepart dimasukkan ke dalam tiket.
- 🖨️ **Kwitansi / Cetak Struk**: Template *Print-Ready* untuk printer kasir atau diekspor menjadi format PDF.
- 📂 **Backup & Restore**: Mengamankan database dengan sekali klik, anti hilang!

## 🚀 Cara Instalasi (Pengembang)

1. **Clone repositori**
   ```bash
   git clone https://github.com/Nuno-Hadianto/NunoxDesk.git
   cd NunoxDesk
   ```

2. **Install Dependensi**
   Pastikan Anda sudah menginstal Node.js v16 atau lebih baru.
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**
   ```bash
   npm start
   ```

## 📦 Build Installer (.exe)
Jika Anda ingin menjadikan program ini aplikasi *Standalone* untuk sistem operasi Windows:
```bash
npm run build
```
File installer `NunoxDesk Setup.exe` akan di-generate dan tersimpan di dalam folder `dist/`.

## 🛠️ Arsitektur Teknologi
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Sangat ringan, minim *dependency*).
- **Backend (Main Process)**: Node.js + Electron API.
- **Database**: `better-sqlite3` dengan eksekusi kueri yang dioptimasi.

---
<div align="center">
  Dibuat dengan 💻 untuk NUNOX_SERVIS.
</div>
