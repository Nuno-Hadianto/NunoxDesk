<template>
  <div class="view-section">
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <!-- Pengaturan Identitas -->
          <div class="stat-card" style="flex: 1; min-width: 300px;">
              <h2>Pengaturan Identitas Toko</h2>
              <form @submit.prevent="saveSettings" style="margin-top: 20px;">
                  <div class="form-group">
                      <label>Nama Usaha / Toko</label>
                      <input type="text" v-model="form.business_name">
                  </div>
                  <div class="form-group">
                      <label>No. Telp / WhatsApp</label>
                      <input type="text" v-model="form.phone">
                  </div>
                  <div class="form-group">
                      <label>Alamat</label>
                      <textarea v-model="form.address" rows="3"></textarea>
                  </div>
                  <div class="form-group">
                      <label>Catatan Bawah Kwitansi</label>
                      <textarea v-model="form.receipt_footer" rows="2"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Simpan Pengaturan</button>
              </form>
          </div>

          <!-- Backup & Restore -->
          <div class="stat-card" style="flex: 1; min-width: 300px;">
              <h2>Backup & Restore Database</h2>
              <p style="color: #64748b; margin-top: 10px; margin-bottom: 20px;">
                  Amankan data aplikasi Anda dengan melakukan backup secara berkala.
              </p>
              <div style="display: flex; gap: 10px;">
                  <button @click="backupData" class="btn btn-primary">Backup Data Sekarang</button>
                  <button @click="restoreData" class="btn btn-secondary">Restore Data</button>
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
