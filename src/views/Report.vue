<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 25px;">
          <div style="display: flex; gap: 10px; align-items: center;">
              <Calendar class="search-icon" :size="18" style="opacity: 0.5; color: var(--text-primary);" />
              <span style="font-weight: 500; color: var(--text-muted);">Filter:</span>
              <input type="date" v-model="startDate" class="form-control" style="width: 150px; border-radius: 20px; padding: 8px 15px;">
              <span style="font-weight: 500; color: var(--text-muted);">s/d</span>
              <input type="date" v-model="endDate" class="form-control" style="width: 150px; border-radius: 20px; padding: 8px 15px;">
              <button @click="generateReport" class="btn btn-primary" style="padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                  Terapkan
              </button>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button @click="printBlankNota" class="btn btn-secondary" style="border-radius: 20px;">Nota Kosong</button>
              <button @click="printBlankReceipt" class="btn btn-secondary" style="border-radius: 20px;">Kwitansi Kosong</button>
              <button @click="exportExcel" class="btn" style="background-color: #10b981; color: white; border-radius: 20px; display: flex; align-items: center; gap: 6px;">
                  <FileSpreadsheet :size="18" /> Unduh Excel
              </button>
              <button @click="exportPdf" class="btn" style="background-color: #ef4444; color: white; border-radius: 20px; display: flex; align-items: center; gap: 6px;">
                  <Printer :size="18" /> Cetak Laporan
              </button>
          </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
          <StatCard title="Total Pendapatan (Omset)" :value="formatCurrency(totalOmset)" variant="primary" :center="true" :borderTop="true">
              <template #icon-small><Wallet :size="16" /></template>
          </StatCard>
          <StatCard title="Total Modal (HPP)" :value="formatCurrency(totalModal)" variant="danger" :center="true" :borderTop="true">
              <template #icon-small><TrendingDown :size="16" /></template>
          </StatCard>
          <StatCard title="Laba Bersih (Profit)" :value="formatCurrency(netProfit)" variant="success" :center="true" :borderTop="true">
              <template #icon-small><TrendingUp :size="16" /></template>
          </StatCard>
          <StatCard title="Transaksi Selesai" :value="services.length" variant="warning" :center="true" :borderTop="true">
              <template #icon-small><CheckCircle :size="16" /></template>
          </StatCard>
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

<script setup lang="ts">
import { Calendar, FileSpreadsheet, Printer, Wallet, TrendingDown, TrendingUp, CheckCircle } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { generateBlankNotaHtml, generateBlankReceiptHtml, generateReportHtml, printHtml, exportHtmlToPdf } from '../utils/printUtils'
import StatCard from '../components/StatCard.vue'
import type { ServiceOrder, Settings } from '../types'

const startDate = ref<string>('')
const endDate = ref<string>('')
const services = ref<ServiceOrder[]>([])

const totalOmset = ref<number>(0)
const totalModal = ref<number>(0)
const netProfit = ref<number>(0)

const formatCurrency = (val: number | string | undefined | null) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(Number(val || 0))

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
          const data = (await window.api.getCompletedServices(startDate.value, endDate.value)) as (ServiceOrder & {total_modal?: number})[]
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
      const data = (await window.api.getCompletedServices(startDate.value, endDate.value)) as ServiceOrder[]
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

const getCommonData = async () => {
  const settings = (await window.api.getSettings()) as Settings
  const logoBase64 = window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  return { settings, logoBase64 }
}

const exportPdf = async () => {
  if (services.value.length === 0) {
      return window.Swal.fire('Info', 'Tidak ada data untuk diekspor pada periode ini.', 'info')
  }
  try {
      const { settings, logoBase64 } = await getCommonData()
      let topParts = []
      if (window.api && window.api.getTopSpareparts) {
          topParts = await window.api.getTopSpareparts(startDate.value, endDate.value)
      }
      
      const html = generateReportHtml(settings, services.value, startDate.value, endDate.value, totalOmset.value, totalModal.value, netProfit.value, logoBase64, topParts)
      const filename = `Laporan_Keuangan_${startDate.value}_sd_${endDate.value}.pdf`
      
      const result = await exportHtmlToPdf(html, filename)
      if (result && result.success) {
          window.Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Laporan PDF berhasil disimpan!',
              timer: 1500,
              showConfirmButton: false
          })
      } else if (result && !result.canceled) {
          window.Swal.fire('Error', 'Gagal menyimpan laporan PDF: ' + (result.error || ''), 'error')
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Terjadi kesalahan saat memproses PDF.', 'error')
  }
}


const printBlankNota = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateBlankNotaHtml(settings, logoBase64)
      await printHtml(html, true) // landscape
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal mencetak nota kosong.', 'error')
  }
}

const printBlankReceipt = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateBlankReceiptHtml(settings, logoBase64)
      await printHtml(html, true) // landscape
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal mencetak kwitansi kosong.', 'error')
  }
}
</script>
