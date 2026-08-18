<template>
  <div class="view-section" v-if="service">
      <div style="margin-bottom: 20px;">
          <button @click="$router.push('/services')" class="btn btn-secondary">&larr; Kembali ke Daftar Servis</button>
      </div>

      <div class="dashboard-grid">
          <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <h2>Detail Tiket: <strong>{{ service.ticket_number }}</strong></h2>
                  <span style="padding: 5px 10px; border-radius: 4px; background: #e2e8f0; font-weight: bold;">
                      {{ service.service_status.toUpperCase() }}
                  </span>
              </div>
              <p><strong>Tanggal Masuk:</strong> {{ formattedDate }}</p>
              <p><strong>Pelanggan:</strong> {{ service.customer_name }} ({{ service.customer_phone || '-' }})</p>
              <p><strong>Perangkat:</strong> {{ service.brand || '' }} {{ service.model || '' }} - {{ service.device_type }} (SN: {{ service.serial_number || '-' }})</p>
              <p><strong>Keluhan:</strong> <span style="color: #ef4444;">{{ service.customer_complaint }}</span></p>
              <hr style="margin: 15px 0; border-top: 1px solid #e2e8f0;">
              
              <!-- Form Update Status -->
              <div style="margin-top: 15px; background: #f8fafc; padding: 15px; border-radius: 6px;">
                  <h3 style="margin-bottom: 10px; font-size: 1rem;">Update Status & Catatan</h3>
                  <div class="form-group">
                      <label>Ubah Status</label>
                      <select v-model="updateForm.status">
                          <option value="Diterima">Diterima</option>
                          <option value="Pengecekan">Pengecekan</option>
                          <option value="Menunggu Sparepart">Menunggu Sparepart</option>
                          <option value="Proses Perbaikan">Proses Perbaikan</option>
                          <option value="Selesai (Belum Diambil)">Selesai (Belum Diambil)</option>
                          <option value="Selesai (Sudah Diambil)">Selesai (Sudah Diambil)</option>
                          <option value="Batal">Batal</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Hasil Pengecekan / Diagnosis</label>
                      <textarea v-model="updateForm.diagnosis_result" rows="2"></textarea>
                  </div>
                  <div class="form-group">
                      <label>Tindakan yang Dilakukan</label>
                      <textarea v-model="updateForm.actions_taken" rows="2"></textarea>
                  </div>
                  <div class="form-group">
                      <label>Catatan Teknisi (Internal)</label>
                      <textarea v-model="updateForm.technician_notes" rows="2"></textarea>
                  </div>
                  <button class="btn btn-primary" @click="saveUpdate">Simpan Perubahan</button>
              </div>
          </div>
          
          <!-- Sebelah kanan untuk history dan sparepart -->
          <div>
              <!-- Sparepart list placeholder -->
              <div class="card" style="margin-bottom: 20px;">
                  <h2>Rincian Biaya & Sparepart</h2>
                  <p>Total Biaya: {{ formatCurrency(service.total_cost) }}</p>
                  <!-- Kita akan implementasikan detail item servis nanti -->
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const service = ref(null)

const updateForm = reactive({
  status: '',
  diagnosis_result: '',
  actions_taken: '',
  technician_notes: ''
})

const formattedDate = computed(() => {
  if (!service.value) return ''
  return new Date(service.value.received_date + 'Z').toLocaleDateString('id-ID')
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
  }).format(amount || 0)
}

const loadServiceDetail = async () => {
  const id = route.params.id
  if (window.api && window.api.getService) {
      try {
          const detail = await window.api.getService(id)
          if (detail) {
              service.value = detail
              updateForm.status = detail.service_status
              updateForm.diagnosis_result = detail.diagnosis_result || ''
              updateForm.actions_taken = detail.actions_taken || ''
              updateForm.technician_notes = detail.technician_notes || ''
          }
      } catch (error) {
          console.error(error)
      }
  }
}

const saveUpdate = async () => {
  try {
      const data = {
          service_status: updateForm.status,
          diagnosis_result: updateForm.diagnosis_result,
          actions_taken: updateForm.actions_taken,
          technician_notes: updateForm.technician_notes
      }
      await window.api.updateService(service.value.id, data)
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Detail servis berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false
      })
      await loadServiceDetail()
  } catch (error) {
      window.Swal.fire('Error', 'Gagal menyimpan.', 'error')
  }
}

onMounted(() => {
  loadServiceDetail()
})
</script>
