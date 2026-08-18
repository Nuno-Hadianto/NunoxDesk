<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 10px;">
              <input type="date" v-model="startDate" class="search-input">
              <span style="align-self: center;">S/D</span>
              <input type="date" v-model="endDate" class="search-input">
              <button @click="generateReport" class="btn btn-primary">Filter</button>
          </div>
          <div style="display: flex; gap: 10px;">
              <button @click="printBlankNota" class="btn btn-secondary">Nota Kosong</button>
              <button @click="printBlankReceipt" class="btn btn-secondary">Kwitansi Kosong</button>
              <button @click="exportExcel" class="btn" style="background-color: #10b981; color: white;">Unduh Excel</button>
              <button @click="exportPdf" class="btn" style="background-color: #ef4444; color: white;">Cetak Laporan</button>
          </div>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div class="stat-card" style="flex: 1;">
              <h3>Total Pendapatan (Omset)</h3>
              <div class="stat-value">{{ formatCurrency(totalOmset) }}</div>
          </div>
          <div class="stat-card" style="flex: 1;">
              <h3>Total Modal (HPP)</h3>
              <div class="stat-value" style="color: #ef4444;">{{ formatCurrency(totalModal) }}</div>
          </div>
          <div class="stat-card" style="flex: 1;">
              <h3>Laba Bersih (Profit)</h3>
              <div class="stat-value" style="color: #10b981;">{{ formatCurrency(netProfit) }}</div>
          </div>
          <div class="stat-card" style="flex: 1;">
              <h3>Transaksi Selesai</h3>
              <div class="stat-value">{{ services.length }}</div>
          </div>
      </div>

      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>No. Tiket</th>
                      <th>Tanggal Selesai</th>
                      <th>Pelanggan</th>
                      <th>Perangkat</th>
                      <th>Total Biaya</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-if="services.length === 0">
                      <td colspan="5" style="text-align: center; padding: 20px;">Tidak ada transaksi selesai pada periode ini.</td>
                  </tr>
                  <tr v-for="s in services" :key="s.id">
                      <td>{{ s.ticket_number }}</td>
                      <td>{{ new Date(s.completed_date + 'Z').toLocaleDateString('id-ID') }}</td>
                      <td>{{ s.customer_name }}</td>
                      <td>{{ s.brand || '' }} {{ s.model || '' }}</td>
                      <td>{{ formatCurrency(s.total_cost) }}</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const startDate = ref('')
const endDate = ref('')
const services = ref([])

const totalOmset = ref(0)
const totalModal = ref(0)
const netProfit = ref(0)

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(val || 0)

onMounted(() => {
  const d = new Date()
  endDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  startDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  generateReport()
})

const generateReport = async () => {
  if (!startDate.value || !endDate.value) return
  if (window.api && window.api.getCompletedServices) {
      try {
          const data = await window.api.getCompletedServices(startDate.value, endDate.value)
          services.value = data
          
          let omset = 0
          let modal = 0
          data.forEach(s => {
              omset += (s.total_cost || 0)
              modal += (s.total_modal || 0)
          })
          
          totalOmset.value = omset
          totalModal.value = modal
          netProfit.value = omset - modal
      } catch (error) {
          console.error(error)
      }
  }
}

const exportExcel = async () => {
  if (!startDate.value || !endDate.value) return
  try {
      const data = await window.api.getCompletedServices(startDate.value, endDate.value)
      if (data.length === 0) return window.Swal.fire('Info', 'Tidak ada data untuk diekspor pada tanggal tersebut.', 'info')
      
      const excelData = data.map(s => ({
          'No Tiket': s.ticket_number,
          'Tanggal Selesai': new Date(s.completed_date + 'Z').toLocaleDateString('id-ID'),
          'Pelanggan': s.customer_name,
          'Perangkat': `${s.brand || ''} ${s.model || ''}`.trim(),
          'Total Biaya': s.total_cost
      }))

      const result = await window.api.exportExcel(excelData)
      if (result.success) {
          window.Swal.fire('Berhasil', `Laporan berhasil disimpan di:\n${result.filePath}`, 'success')
      } else if (!result.canceled) {
          window.Swal.fire('Error', "Gagal menyimpan file Excel: " + result.error, 'error')
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Terjadi kesalahan saat membuat Excel.', 'error')
  }
}

const exportPdf = () => {
  // We can trigger an IPC event to print PDF if implemented,
  // or use window.print() if a specific print view is created.
  window.Swal.fire('Info', 'Fitur cetak laporan PDF akan tersedia. (Perlu memanggil print via electron)', 'info')
}

const printBlankNota = () => {
  window.Swal.fire('Info', 'Fitur nota kosong akan tersedia.', 'info')
}

const printBlankReceipt = () => {
  window.Swal.fire('Info', 'Fitur kwitansi kosong akan tersedia.', 'info')
}
</script>
