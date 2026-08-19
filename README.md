<div align="center">
  <h1>nuNox Servis</h1>
  <p><strong>Aplikasi Kasir (POS) & Manajemen Servis Komputer/Laptop Offline</strong></p>
</div>

---

## Tentang Aplikasi
**nuNox Servis** dibikin buat bantu temen-temen teknisi atau pemilik konter servis (laptop, PC, HP, dll) buat nyatet kerjaan biar lebih rapi. Karena di lapangan kadang koneksi internet nggak stabil, aplikasi ini dirancang full **offline**. Data pelanggan, riwayat servis, sama pembukuan bulanan nyimpen langsung di laptop/PC lokal secara aman.

## Fitur
- 📊 **Dashboard Simple**: Buat mantau ada berapa garapan yang belum kelar, ringkasan pemasukan, dan peringatan otomatis kalau ada barang yang kelamaan numpuk atau nunggu *sparepart*.
- 👥 **Data Pelanggan & WA**: Nyatet data pelanggan sekalian bisa langsung kirim nota atau tagihan lewat WhatsApp Web.
- 🔧 **Tracking Servis**: Catet status garapan mulai dari *Masuk*, *Dikerjakan*, *Selesai*, sampai urusan bayar (bisa DP atau lunas).
- 📦 **Stok Sparepart**: Kalau ada pemakaian sparepart, stok otomatis kepotong. Ada juga fitur buat ngecek sparepart apa yang paling laku tiap bulannya.
- 🖨️ **Cetak Nota & Laporan**: Bisa cetak nota/struk buat dikasih ke pelanggan. Buat pemilik, ada fitur export laporan keuangan bulanan ke PDF yang rapi.
- 🔐 **Keamanan & Backup**: Dilengkapi sistem login dan fitur backup database SQLite tinggal klik.

## Cara Install (Buat Developer)

Kalau mau nyoba jalanin atau modif kodenya:

1. **Clone repo ini**
   ```bash
   git clone https://github.com/Nuno-Hadianto/nuNox_servis.git
   cd nuNox_servis
   ```

2. **Install Dependencies**
   (Pastiin udah install Node.js v18 ke atas)
   ```bash
   npm install
   ```

3. **Jalanin Mode Dev**
   Karena pakai Vite buat frontend dan Electron buat backend, cukup run:
   ```bash
   npm run dev:all
   ```

## Build Installer (.exe)
Kalau mau di-build jadi installer Windows (.exe) biar gampang diinstal di PC lain:
```bash
npm run build
```
Nanti hasil `.exe` nya ada di folder `dist/`.

## Tech Stack
- **Frontend**: Vue 3 (Composition API) + Vite + TypeScript.
- **Backend**: Node.js + Electron.
- **Database**: SQLite (`better-sqlite3`). Ringan, lokal, dan nggak ribet setup server.

## Lisensi
Proyek ini rilis pakai **MIT License**. Bebas mau dipakai, dimodif, atau dikembangin lagi.
