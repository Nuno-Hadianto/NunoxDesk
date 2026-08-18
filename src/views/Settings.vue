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
                  <div style="margin-top: 25px; text-align: right;">
                      <button type="submit" class="btn btn-primary" style="padding: 10px 24px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">💾 Simpan Pengaturan</button>
                  </div>
              </form>
          </div>

          <!-- Backup & Restore -->
          <div class="card" style="flex: 1; min-width: 300px; padding: 25px;">
              <h2 style="font-size: 1.2rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">🗄️ Backup & Restore Data</h2>
              <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                  <h3 style="font-size: 1rem; margin-bottom: 8px;">Amankan Data Anda</h3>
                  <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">
                      Lakukan backup secara berkala untuk menghindari kehilangan data penting (pelanggan, tiket servis, keuangan). Data akan disimpan dalam format `.db` di folder dokumen Anda.
                  </p>
                  <button @click="backupData" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 10px 20px;">
                      ☁️ Backup Data Sekarang
                  </button>
              </div>
              
              <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); padding: 20px;">
                  <h3 style="font-size: 1rem; margin-bottom: 8px; color: #ef4444;">Pulihkan Data (Restore)</h3>
                  <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">
                      Perhatian: Mengembalikan (Restore) data akan menimpa <strong>seluruh</strong> data aplikasi Anda saat ini dengan data dari file backup. Pastikan Anda memilih file yang benar!
                  </p>
                  <button @click="restoreData" class="btn" style="background-color: white; color: #ef4444; border: 1px solid #ef4444; display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 10px 20px;">
                      🔄 Pilih File Restore
                  </button>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const form = reactive({
  business_name: '',
  phone: '',
  address: '',
  receipt_footer: ''
})

const loadSettings = async () => {
  if (window.api && window.api.getSettings) {
      try {
          const settings = await window.api.getSettings()
          form.business_name = settings.business_name || ''
          form.phone = settings.phone || settings.whatsapp || ''
          form.address = settings.address || ''
          form.receipt_footer = settings.receipt_footer || ''
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
          receipt_footer: form.receipt_footer
      }
      await window.api.updateSettings(data)
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Pengaturan berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal menyimpan pengaturan.', 'error')
  }
}

const backupData = async () => {
  try {
      const success = await window.api.backupDatabase()
      if (success) {
          window.Swal.fire('Berhasil', 'Backup database berhasil!', 'success')
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal backup database.', 'error')
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
      } catch (error) {
          console.error(error)
          window.Swal.fire('Error', 'Gagal restore database.', 'error')
      }
  }
}

onMounted(() => {
  loadSettings()
})
</script>
