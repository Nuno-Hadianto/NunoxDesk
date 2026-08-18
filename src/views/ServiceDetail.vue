<template>
  <div class="view-section" v-if="service">
      <div class="action-bar" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 25px;">
          <button @click="$router.push('/services')" class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 8px 16px;">
              <span>&larr;</span> Kembali
          </button>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button @click="sendWhatsApp" class="btn" style="background-color: #25D366; color: white; display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  💬 Kirim WA
              </button>
              <button @click="exportPdfInvoice" class="btn" style="background-color: #ef4444; color: white; display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  📄 Unduh PDF
              </button>
              <button @click="printThermal" class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  🖨️ Cetak Thermal
              </button>
              <button @click="printNota" class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  Cetak Tanda Terima
              </button>
              <button @click="printReceipt" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  Cetak Invoice
              </button>
          </div>
      </div>

      <div class="dashboard-grid">
          <div class="card" style="padding: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
                  <div>
                      <h2 style="font-size: 1.5rem; margin-bottom: 5px; color: var(--primary-color);">{{ service.ticket_number }}</h2>
                      <p style="color: var(--text-muted); font-size: 0.9rem;">Masuk: {{ formattedDate }}</p>
                  </div>
                  <span :style="statusStyle(service.service_status)" style="font-size: 0.9rem; padding: 6px 14px; border-radius: 20px; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      {{ service.service_status.toUpperCase() }}
                  </span>
              </div>
              
              <div style="background: rgba(248, 250, 252, 0.5); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
                  <h3 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Info Pelanggan & Perangkat</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                      <div>
                          <p style="margin-bottom: 5px;"><strong>Nama:</strong> {{ service.customer_name }}</p>
                          <p><strong>No. HP:</strong> {{ service.customer_phone || '-' }}</p>
                      </div>
                      <div>
                          <p style="margin-bottom: 5px;"><strong>Tipe:</strong> {{ service.brand || '' }} {{ service.model || '' }} - {{ service.device_type }}</p>
                          <p><strong>SN:</strong> {{ service.serial_number || '-' }}</p>
                      </div>
                  </div>
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
                      <p><strong>Keluhan:</strong> <span style="color: #ef4444; font-weight: 500;">{{ service.customer_complaint }}</span></p>
                  </div>
              </div>
              
              <!-- Form Update Status -->
              <div style="margin-top: 25px;">
                  <h3 style="margin-bottom: 15px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">📝 Update Status & Catatan</h3>
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                      <div class="form-group" style="margin: 0;">
                          <label style="font-size: 0.85rem;">Ubah Status</label>
                          <select v-model="updateForm.status" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                              <option value="Diterima">Diterima</option>
                              <option value="Pengecekan">Pengecekan</option>
                              <option value="Menunggu Sparepart">Menunggu Sparepart</option>
                              <option value="Proses Perbaikan">Proses Perbaikan</option>
                              <option value="Selesai (Belum Diambil)">Selesai (Belum Diambil)</option>
                              <option value="Selesai (Sudah Diambil)">Selesai (Sudah Diambil)</option>
                              <option value="Batal">Batal</option>
                          </select>
                      </div>
                      <div class="form-group" style="margin: 0;">
                          <label style="font-size: 0.85rem;">Hasil Diagnosis / Tindakan Dilakukan</label>
                          <div style="display: flex; gap: 10px;">
                              <textarea v-model="updateForm.diagnosis_result" rows="2" placeholder="Hasil Pengecekan" style="flex: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; resize: vertical;"></textarea>
                              <textarea v-model="updateForm.actions_taken" rows="2" placeholder="Tindakan" style="flex: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; resize: vertical;"></textarea>
                          </div>
                      </div>
                      <div class="form-group" style="margin: 0;">
                          <label style="font-size: 0.85rem;">Catatan Internal (Teknisi)</label>
                          <textarea v-model="updateForm.technician_notes" rows="2" placeholder="Catatan ini tidak muncul di struk" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; resize: vertical;"></textarea>
                      </div>
                      <button class="btn btn-primary" @click="saveUpdate" style="align-self: flex-end; padding: 10px 24px; border-radius: 20px;">💾 Simpan Perubahan</button>
                  </div>
              </div>

              <!-- History Log -->
              <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                  <h3 style="margin-bottom: 15px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">🕰️ Riwayat Status</h3>
                  <div style="background: var(--bg-color); padding: 15px; border-radius: var(--radius-md); max-height: 250px; overflow-y: auto;">
                      <ul style="list-style: none; padding: 0; margin: 0; position: relative; border-left: 2px solid #cbd5e1; margin-left: 10px;">
                          <li v-for="h in history" :key="h.id" style="margin-bottom: 15px; padding-left: 15px; position: relative;">
                              <span style="position: absolute; left: -6px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: var(--primary-color);"></span>
                              <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">{{ new Date(h.created_at + 'Z').toLocaleString('id-ID') }}</div>
                              <div style="font-weight: 600; color: var(--text-color);">{{ h.status }}</div>
                              <div v-if="h.notes" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; background: white; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">{{ h.notes }}</div>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
          
          <!-- Sebelah kanan untuk history dan sparepart -->
          <div>
              <!-- Rincian Biaya -->
              <div class="card" style="margin-bottom: 20px; padding: 25px;">
                  <h2 style="font-size: 1.2rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">💰 Rincian Biaya & Sparepart</h2>
                  
                  <div style="display: flex; gap: 10px; margin-bottom: 20px; background: var(--bg-color); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                      <select v-model="itemForm.type" @change="onItemTypeChange" style="padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background: white;">
                          <option value="Jasa">Jasa</option>
                          <option value="Sparepart">Sparepart</option>
                          <option value="Biaya lainnya">Lainnya</option>
                          <option value="Diskon">Diskon</option>
                      </select>
                      
                      <select v-if="itemForm.type === 'Sparepart'" v-model="itemForm.partId" @change="onPartChange" style="padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background: white; flex: 1;">
                          <option value="">-- Pilih Sparepart --</option>
                          <option v-for="p in parts" :key="p.id" :value="p.id" :disabled="p.stock <= 0">
                              {{ p.name }} (Stok: {{ p.stock }})
                          </option>
                      </select>
                      
                      <input v-else type="text" v-model="itemForm.desc" placeholder="Keterangan" style="flex: 1; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
                      
                      <input type="number" v-model.number="itemForm.qty" placeholder="Qty" min="1" style="width: 60px; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
                      <input type="number" v-model.number="itemForm.price" placeholder="Harga" style="width: 110px; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
                      <button @click="addItem" class="btn btn-primary" style="padding: 8px 16px; border-radius: var(--radius-sm);">➕</button>
                  </div>
                  
                  <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
                      <ul style="list-style: none; padding: 0; margin: 0;">
                          <li v-for="item in items" :key="item.id" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid var(--border-color);">
                              <div>
                                  <div style="font-weight: 600; color: var(--text-color);">{{ item.item_type }} <span style="font-weight: normal; color: var(--text-muted);"> - {{ item.description }}</span></div>
                                  <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                                      {{ item.quantity }} x {{ formatCurrency(item.price) }}
                                  </div>
                              </div>
                              <div style="display: flex; align-items: center; gap: 15px;">
                                  <span style="font-weight: 700; color: var(--primary-color);">{{ formatCurrency(item.subtotal) }}</span>
                                  <button @click="deleteItem(item.id)" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; opacity: 0.8;">Hapus</button>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; padding: 15px 20px; background: rgba(99, 102, 241, 0.05); border-radius: var(--radius-md); margin-top: 15px; color: var(--primary-color);">
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
