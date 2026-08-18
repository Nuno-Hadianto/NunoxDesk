<template>
  <div class="view-section" v-if="service">
      <div class="action-bar" style="display: flex; justify-content: space-between;">
          <button @click="$router.push('/services')" class="btn btn-secondary">&larr; Kembali ke Daftar Servis</button>
          <div>
              <button @click="sendWhatsApp" class="btn" style="background-color: #25D366; color: white; margin-right: 10px;">💬 Kirim WA</button>
              <button @click="exportPdfInvoice" class="btn" style="background-color: #ef4444; color: white; margin-right: 10px;">📄 Unduh PDF</button>
              <button @click="printThermal" class="btn btn-secondary" style="margin-right: 10px;">🖨️ Cetak Thermal</button>
              <button @click="printNota" class="btn btn-secondary" style="margin-right: 10px;">Cetak Tanda Terima</button>
              <button @click="printReceipt" class="btn btn-secondary">Cetak Invoice</button>
          </div>
      </div>

      <div class="dashboard-grid">
          <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <h2>Detail Tiket: <strong>{{ service.ticket_number }}</strong></h2>
                  <span :style="statusStyle(service.service_status)">
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

              <!-- History Log -->
              <div style="margin-top: 20px;">
                  <h3 style="margin-bottom: 10px; font-size: 1rem;">Riwayat Status</h3>
                  <ul style="list-style: none; padding: 0; max-height: 200px; overflow-y: auto;">
                      <li v-for="h in history" :key="h.id" style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                          <div style="font-size: 0.8rem; color: #64748b;">{{ new Date(h.created_at + 'Z').toLocaleString('id-ID') }}</div>
                          <div style="font-weight: 500;">{{ h.status }}</div>
                          <div v-if="h.notes" style="font-size: 0.9rem; color: #334155; margin-top: 5px;">{{ h.notes }}</div>
                      </li>
                  </ul>
              </div>
          </div>
          
          <!-- Sebelah kanan untuk history dan sparepart -->
          <div>
              <!-- Rincian Biaya -->
              <div class="card" style="margin-bottom: 20px;">
                  <h2>Rincian Biaya & Sparepart</h2>
                  <div style="display: flex; gap: 10px; margin-top: 10px; margin-bottom: 10px;">
                      <select v-model="itemForm.type" @change="onItemTypeChange" style="padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
                          <option value="Jasa">Jasa</option>
                          <option value="Sparepart">Sparepart</option>
                          <option value="Biaya lainnya">Biaya lainnya</option>
                          <option value="Diskon">Diskon</option>
                      </select>
                      
                      <select v-if="itemForm.type === 'Sparepart'" v-model="itemForm.partId" @change="onPartChange" style="padding:6px; border:1px solid #e2e8f0; border-radius:4px; max-width: 150px;">
                          <option value="">-- Pilih Sparepart --</option>
                          <option v-for="p in parts" :key="p.id" :value="p.id" :disabled="p.stock <= 0">
                              {{ p.name }} (Stok: {{ p.stock }})
                          </option>
                      </select>
                      
                      <input v-else type="text" v-model="itemForm.desc" placeholder="Keterangan" style="flex: 1; padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
                      
                      <input type="number" v-model.number="itemForm.qty" placeholder="Qty" min="1" style="width: 60px; padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
                      <input type="number" v-model.number="itemForm.price" placeholder="Harga" style="width: 120px; padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
                      <button @click="addItem" class="btn btn-primary" style="padding: 6px 12px;">Tambah</button>
                  </div>
                  
                  <ul style="list-style: none; padding: 0; margin-bottom: 15px;">
                      <li v-for="item in items" :key="item.id" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                          <div>
                              <strong>{{ item.item_type }}</strong> - {{ item.description }}
                              <div style="font-size: 0.85rem; color: #64748b;">
                                  {{ item.quantity }} x {{ formatCurrency(item.price) }}
                              </div>
                          </div>
                          <div style="display: flex; align-items: center; gap: 10px;">
                              <span style="font-weight: 600;">{{ formatCurrency(item.subtotal) }}</span>
                              <button @click="deleteItem(item.id)" class="btn btn-danger" style="padding: 2px 5px; font-size: 0.7rem;">Hapus</button>
                          </div>
                      </li>
                  </ul>
                  <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                      <span>Total Biaya:</span>
                      <span>{{ formatCurrency(service.total_cost) }}</span>
                  </div>
              </div>

              <!-- Pembayaran -->
              <div class="card">
                  <h2>Pembayaran</h2>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                      <span>Status: <strong :style="paymentStatusStyle(service.payment_status)">{{ service.payment_status.toUpperCase() }}</strong></span>
                  </div>
                  
                  <ul style="list-style: none; padding: 0; margin-bottom: 15px;">
                      <li v-for="p in payments" :key="p.id" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
                          <div style="display:flex; justify-content:space-between;">
                              <strong>{{ p.payment_number }}</strong>
                              <span style="color:#4f46e5; font-weight:bold;">{{ formatCurrency(p.amount) }}</span>
                          </div>
                          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
                              <span>{{ new Date(p.payment_date + 'Z').toLocaleString('id-ID') }} - {{ p.payment_method }}</span>
                              <button @click="deletePayment(p.id)" class="btn btn-danger" style="padding:2px 5px; font-size:0.7rem;">Hapus</button>
                          </div>
                      </li>
                  </ul>
                  
                  <div style="background: #f8fafc; padding: 10px; border-radius: 6px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                          <span>Total Dibayar:</span>
                          <strong>{{ formatCurrency(totalPaid) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; color: #ef4444; font-weight: bold;">
                          <span>Sisa Tagihan:</span>
                          <span>{{ formatCurrency(remainingBill) }}</span>
                      </div>
                      <div v-if="remainingBill > 0" style="margin-top: 10px; display: flex; gap: 10px;">
                          <input type="number" v-model.number="paymentForm.amount" placeholder="Nominal" style="flex: 1; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px;">
                          <select v-model="paymentForm.method" style="padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px;">
                              <option value="Tunai">Tunai</option>
                              <option value="Transfer">Transfer</option>
                              <option value="Debit/Kredit">Debit/Kredit</option>
                              <option value="QRIS">QRIS</option>
                          </select>
                          <button @click="addPayment" class="btn btn-primary" style="padding: 6px 12px;">Bayar</button>
                      </div>
                  </div>
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

const history = ref([])
const items = ref([])
const payments = ref([])
const parts = ref([])

const updateForm = reactive({
  status: '',
  diagnosis_result: '',
  actions_taken: '',
  technician_notes: ''
})

const itemForm = reactive({
  type: 'Jasa',
  partId: '',
  desc: '',
  qty: 1,
  price: 0
})

const paymentForm = reactive({
  amount: 0,
  method: 'Tunai'
})

const formattedDate = computed(() => {
  if (!service.value) return ''
  return new Date(service.value.received_date + 'Z').toLocaleDateString('id-ID')
})

const totalPaid = computed(() => {
  return payments.value.reduce((acc, p) => acc + p.amount, 0)
})

const remainingBill = computed(() => {
  if (!service.value) return 0
  const rem = service.value.total_cost - totalPaid.value
  return rem > 0 ? rem : 0
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
  }).format(amount || 0)
}

const statusStyle = (status) => {
  let bg = '#e2e8f0'
  let color = '#334155'
  if (status === 'Selesai (Sudah Diambil)') { bg = '#10b981'; color = 'white' }
  else if (status === 'Proses Perbaikan') { bg = '#3b82f6'; color = 'white' }
  else if (status === 'Menunggu Sparepart') { bg = '#f59e0b'; color = 'white' }
  else if (status === 'Batal') { bg = '#ef4444'; color = 'white' }
  
  return {
      padding: '5px 10px',
      borderRadius: '4px',
      background: bg,
      color: color,
      fontWeight: 'bold'
  }
}

const paymentStatusStyle = (status) => {
  if (status === 'Lunas') return { color: '#10b981' }
  if (status === 'DP / Sebagian') return { color: '#f59e0b' }
  return { color: '#ef4444' }
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
              paymentForm.amount = 0 // reset default payment nominal
          }
      } catch (error) {
          console.error(error)
      }
  }
}

const loadHistory = async () => {
  const id = route.params.id
  if (window.api && window.api.getServiceHistory) {
      history.value = await window.api.getServiceHistory(id)
  }
}

const loadItems = async () => {
  const id = route.params.id
  if (window.api && window.api.getServiceItems) {
      items.value = await window.api.getServiceItems(id)
  }
}

const loadPayments = async () => {
  const id = route.params.id
  if (window.api && window.api.getPayments) {
      payments.value = await window.api.getPayments(id)
  }
}

const loadParts = async () => {
  if (window.api && window.api.getParts) {
      parts.value = await window.api.getParts()
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
      await loadHistory()
  } catch (error) {
      window.Swal.fire('Error', 'Gagal menyimpan.', 'error')
  }
}

// Item logic
const onItemTypeChange = () => {
  itemForm.desc = ''
  itemForm.partId = ''
  itemForm.price = 0
}

const onPartChange = () => {
  const part = parts.value.find(p => p.id === itemForm.partId)
  if (part) {
      itemForm.price = part.sell_price
  }
}

const addItem = async () => {
  let desc = itemForm.desc
  let partId = null
  
  if (itemForm.type === 'Sparepart') {
      partId = itemForm.partId
      if (!partId) return window.Swal.fire('Info', 'Pilih sparepart!', 'info')
      desc = 'Sparepart ID: ' + partId
  } else {
      if (!desc) return window.Swal.fire('Info', 'Keterangan wajib diisi!', 'info')
  }

  if (!itemForm.qty || isNaN(itemForm.price)) {
      return window.Swal.fire('Info', 'Qty dan Harga harus valid!', 'info')
  }

  const data = {
      service_order_id: service.value.id,
      item_type: itemForm.type,
      spare_part_id: partId || null,
      description: desc,
      quantity: itemForm.qty,
      price: itemForm.price
  }

  try {
      await window.api.addServiceItem(data)
      itemForm.desc = ''
      itemForm.partId = ''
      itemForm.price = 0
      itemForm.qty = 1
      
      await loadItems()
      await loadServiceDetail()
      if (itemForm.type === 'Sparepart') await loadParts()
  } catch (error) {
      window.Swal.fire('Error', 'Gagal menambah item (Stok tidak cukup atau error lain).', 'error')
  }
}

const deleteItem = async (itemId) => {
  const result = await window.Swal.fire({
      title: 'Hapus item ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
      await window.api.deleteServiceItem(itemId)
      await loadItems()
      await loadServiceDetail()
      await loadParts()
  }
}

// Payment logic
const addPayment = async () => {
  if (paymentForm.amount <= 0) return window.Swal.fire('Info', 'Nominal harus lebih dari 0', 'info')
  if (paymentForm.amount > remainingBill.value) {
      const confirm = await window.Swal.fire({
          title: 'Nominal Berlebih',
          text: `Nominal yang dimasukkan (${formatCurrency(paymentForm.amount)}) lebih besar dari sisa tagihan (${formatCurrency(remainingBill.value)}). Tetap lanjutkan?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Lanjutkan'
      })
      if (!confirm.isConfirmed) return
  }

  const data = {
      service_order_id: service.value.id,
      amount: paymentForm.amount,
      payment_method: paymentForm.method,
      notes: ''
  }

  try {
      await window.api.addPayment(data)
      paymentForm.amount = 0
      await loadPayments()
      await loadServiceDetail()
  } catch (error) {
      window.Swal.fire('Error', 'Gagal memproses pembayaran.', 'error')
  }
}

const deletePayment = async (paymentId) => {
  const result = await window.Swal.fire({
      title: 'Hapus pembayaran?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
      await window.api.deletePayment(paymentId, service.value.id)
      await loadPayments()
      await loadServiceDetail()
  }
}

// Export / Print Logic
import { generateNotaHtml, generateInvoiceHtml, generateThermalNotaHtml, printHtml, exportHtmlToPdf } from '../utils/printUtils.js'

const getCommonData = async () => {
  const settings = await window.api.getSettings()
  const logoBase64 = window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  return { settings, logoBase64 }
}

const sendWhatsApp = () => {
  if (!service.value) return
  const phone = service.value.customer_phone
  if (!phone) {
      return window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
  }
  let targetPhone = phone.replace(/^0/, '62')
  
  const text = `Halo Kak ${service.value.customer_name},
Perangkat ${service.value.brand || ''} ${service.value.model || ''} dengan No Tiket *${service.value.ticket_number}* saat ini berstatus: *${service.value.service_status}*.
Sisa Tagihan: *${formatCurrency(remainingBill.value)}*.
Terima kasih telah mempercayakan perbaikan kepada kami.`

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const exportPdfInvoice = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateInvoiceHtml(settings, service.value, items.value, payments.value, logoBase64)
      const filename = `Invoice_${service.value.ticket_number}_${service.value.customer_name.replace(/\s+/g, '_')}.pdf`
      
      const result = await exportHtmlToPdf(html, filename)
      if (result && result.success) {
          window.Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'PDF berhasil disimpan!',
              timer: 1500,
              showConfirmButton: false
          })
      } else if (result && !result.canceled) {
          window.Swal.fire('Error', 'Gagal menyimpan PDF: ' + (result.error || ''), 'error')
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Terjadi kesalahan saat memproses PDF.', 'error')
  }
}

const printNota = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateNotaHtml(settings, service.value, logoBase64)
      await printHtml(html, true) // landscape for nota
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal mencetak tanda terima.', 'error')
  }
}

const printThermal = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateThermalNotaHtml(settings, service.value, logoBase64)
      await printHtml(html, false, true) // portrait for thermal, isThermal = true
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal mencetak struk thermal.', 'error')
  }
}

const printReceipt = async () => {
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateInvoiceHtml(settings, service.value, items.value, payments.value, logoBase64)
      await printHtml(html, false) // portrait for invoice
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal mencetak invoice.', 'error')
  }
}

onMounted(async () => {
  await loadServiceDetail()
  await loadHistory()
  await loadItems()
  await loadPayments()
  await loadParts()
  
  // Set default payment nominal
  if (remainingBill.value > 0) {
      paymentForm.amount = remainingBill.value
  }
})
</script>
