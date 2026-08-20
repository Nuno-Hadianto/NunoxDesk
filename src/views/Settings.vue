<template>
  <div class="view-section">
      <div style="display: flex; gap: 25px; flex-wrap: wrap;">
          <!-- Pengaturan Identitas -->
          <div class="card" style="flex: 1; min-width: 300px; padding: 25px;">
              <h2 style="font-size: 1.2rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">🏢 Pengaturan Identitas Toko</h2>
              <form @submit.prevent="saveSettings">
                  <div class="form-group">
                      <label style="font-weight: 500; font-size: 0.9rem;">Nama Usaha / Toko</label>
                      <input type="text" v-model="form.business_name" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                  </div>
                  <div class="form-group">
                      <label style="font-weight: 500; font-size: 0.9rem;">No. Telp / WhatsApp</label>
                      <input type="text" v-model="form.phone" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                  </div>
                  <div class="form-group">
                      <label style="font-weight: 500; font-size: 0.9rem;">Alamat Lengkap</label>
                      <textarea v-model="form.address" rows="3" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%; resize: vertical;"></textarea>
                  </div>
                  <div class="form-group">
                      <label style="font-weight: 500; font-size: 0.9rem;">Catatan Bawah Kwitansi</label>
                      <textarea v-model="form.receipt_footer" rows="2" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%; resize: vertical;"></textarea>
                  </div>
                  <div class="form-group">
                      <label style="font-weight: 500; font-size: 0.9rem;">Batas Peringatan Stok Tipis</label>
                      <input type="number" v-model="form.low_stock_threshold" min="0" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                      <small style="color: var(--text-muted); display: block; margin-top: 4px;">Munculkan peringatan di Dasbor jika stok sparepart <= angka ini.</small>
                  </div>
                  <div style="margin-top: 25px; text-align: right;">
                      <button type="submit" class="btn btn-primary" style="padding: 10px 24px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">💾 Simpan Pengaturan</button>
                  </div>
              </form>
          </div>

          <!-- Backup & Restore -->
          <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px;">
              <div class="card" style="padding: 25px;">
                  <h2 style="font-size: 1.2rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">☁️ Auto-Backup (Cloud/Folder)</h2>
                  <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 20px; margin-bottom: 15px;">
                      <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">
                          Pilih folder <strong>Google Drive</strong>, <strong>OneDrive</strong>, atau folder aman lainnya di komputer Anda. Aplikasi akan otomatis melakukan pencadangan setiap kali Anda menutup aplikasi.
                      </p>
                      <div style="display: flex; gap: 10px; align-items: center;">
                          <input type="text" v-model="form.auto_backup_path" readonly placeholder="Belum ada folder yang dipilih..." style="flex: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; background: #f9fafb;">
                          <button @click="selectBackupDir" class="btn btn-primary" style="padding: 10px 15px; border-radius: var(--radius-sm);">Pilih Folder</button>
                      </div>
                      <div style="margin-top: 15px; text-align: right;">
                          <button @click="saveSettings" class="btn btn-primary" style="padding: 8px 16px; border-radius: 20px;">💾 Simpan Pengaturan Backup</button>
                      </div>
                  </div>
              </div>

              <div class="card" style="padding: 25px;">
                  <h2 style="font-size: 1.2rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">🗄️ Manual Backup & Restore</h2>
                  <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                      <button @click="backupData" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 10px 20px; margin-bottom: 15px; width: 100%; justify-content: center;">
                          ⬇️ Backup Data Sekarang
                      </button>
                      <button @click="restoreData" class="btn" style="background-color: white; color: #ef4444; border: 1px solid #ef4444; display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 10px 20px; width: 100%; justify-content: center;">
                          🔄 Pulihkan Data (Restore)
                      </button>
                      <p style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.4; margin-top: 10px; text-align: center;">
                          Restore akan menimpa seluruh data aplikasi.
                      </p>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Settings } from '../types'

const form = reactive<Settings>({
  business_name: '',
  phone: '',
  address: '',
  receipt_footer: '',
  auto_backup_path: ''
})

const loadSettings = async () => {
  if (window.api && window.api.getSettings) {
      try {
          const settings = (await window.api.getSettings()) as Settings
          form.business_name = settings.business_name || ''
          form.phone = settings.phone || settings.whatsapp || ''
          form.address = settings.address || ''
          form.receipt_footer = settings.receipt_footer || ''
          form.auto_backup_path = settings.auto_backup_path || ''
          form.low_stock_threshold = settings.low_stock_threshold !== undefined ? Number(settings.low_stock_threshold) : 3
      } catch (error) {
          console.error(error)
      }
  }
}

const saveSettings = async () => {
  try {
      const data = {
          business_name: form.business_name,
          phone: form.phone,
          whatsapp: form.phone,
          address: form.address,
          receipt_footer: form.receipt_footer,
          auto_backup_path: form.auto_backup_path,
          low_stock_threshold: form.low_stock_threshold
      }
      await window.api.updateSettings(data)
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Pengaturan berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal menyimpan pengaturan.', 'error')
  }
}

const backupData = async () => {
  try {
      const success = await window.api.backupDatabase()
      if (success) {
          window.Swal.fire('Berhasil', 'Backup database berhasil!', 'success')
      }
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal backup database.', 'error')
  }
}

const selectBackupDir = async () => {
    try {
        const path = await window.api.selectDirectory();
        if (path) {
            form.auto_backup_path = path;
        }
    } catch (e: any) {
        console.error(e);
    }
}

const restoreData = async () => {
  const result = await window.Swal.fire({
      title: 'Peringatan',
      text: "Restore akan menimpa semua data saat ini. Aplikasi akan ditutup dan dibuka ulang. Yakin ingin melanjutkan?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Restore'
  })

  if (result.isConfirmed) {
      try {
          const success = await window.api.restoreDatabase()
          if (success) {
              window.Swal.fire({
                  icon: 'success',
                  title: 'Restore Berhasil!',
                  text: 'Aplikasi akan dimuat ulang secara otomatis untuk menerapkan data baru...',
                  showConfirmButton: false,
                  timer: 2500
              })
          }
      } catch (error: any) {
          console.error(error)
          window.Swal.fire('Error', error.message || 'Gagal restore database.', 'error')
      }
  }
}

onMounted(() => {
  loadSettings()
})
</script>
