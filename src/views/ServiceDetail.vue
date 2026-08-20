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

              <!-- Photo Gallery -->
              <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                  <h3 style="margin-bottom: 15px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">📸 Dokumentasi Visual</h3>
                  
                  <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                      <label class="btn btn-secondary" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem;">
                          + Foto Sebelum
                          <input type="file" style="display: none;" accept="image/*" @change="e => handlePhotoUpload(e, 'Sebelum')">
                      </label>
                      <label class="btn btn-secondary" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem;">
                          + Foto Sesudah
                          <input type="file" style="display: none;" accept="image/*" @change="e => handlePhotoUpload(e, 'Sesudah')">
                      </label>
                  </div>
                  
                  <div v-if="photos.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px;">
                      <div v-for="p in photos" :key="p.id" style="position: relative; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--glass-border); aspect-ratio: 1; background: var(--bg-color);">
                          <img :src="'file:///' + p.filepath.replace(/\\\\/g, '/')" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.2s;" @click="previewImage = p.filepath" class="photo-thumbnail">
                          <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.6); color: white; font-size: 0.7rem; padding: 4px; text-align: center; backdrop-filter: blur(4px);">{{ p.photo_type }}</div>
                          <button @click="deletePhoto(p.id)" style="position: absolute; top: 4px; right: 4px; background: rgba(239,68,68,0.9); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">&times;</button>
                      </div>
                  </div>
                  <div v-else style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Belum ada foto dokumentasi.</div>
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
                                  <button @click="deleteItem(item.id)" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; opacity: 0.8; display: inline-flex; align-items: center; gap: 6px;"><Trash2 :size="14" /> Hapus</button>
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
                              <button @click="deletePayment(p.id)" class="btn btn-danger" style="padding:2px 5px; font-size:0.7rem; display: inline-flex; align-items: center; gap: 6px;"><Trash2 :size="14" /> Hapus</button>
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

  <!-- WhatsApp Preview Modal -->
  <div v-if="isWaModalOpen" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="modal-content" style="background: var(--bg-color); padding: 30px; border-radius: var(--radius-lg); width: 100%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
          <h2 style="margin-bottom: 20px; color: var(--primary-color);">📱 Pratinjau Pesan WhatsApp</h2>
          
          <div class="form-group" style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-color);">Isi Pesan</label>
              <textarea v-model="waMessage" rows="8" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.95rem; line-height: 1.5; resize: vertical;"></textarea>
              <small style="color: #64748b; margin-top: 5px; display: block;">Anda bisa mengedit pesan ini sebelum mengirimnya.</small>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button @click="isWaModalOpen = false" class="btn btn-secondary" style="padding: 10px 20px; border-radius: 8px;">Batal</button>
              <button @click="confirmSendWa" class="btn" style="background-color: #25D366; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                  Buka di WhatsApp
              </button>
          </div>
      </div>
      
      <!-- Image Preview Modal -->
      <div v-if="previewImage" class="modal show" @click.self="previewImage = null" style="background: rgba(0,0,0,0.85);">
          <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center;">
              <span class="close-modal" @click="previewImage = null" style="position: absolute; top: -40px; right: 0; color: white; font-size: 2.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">&times;</span>
              <img :src="'file:///' + previewImage.replace(/\\\\/g, '/')" style="max-width: 100%; max-height: 85vh; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); object-fit: contain;">
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Trash2 } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ServiceOrder, ServiceHistory, ServiceItem, Payment, Part, Settings, Photo } from '../types'
import { generateNotaHtml, generateInvoiceHtml, generateThermalNotaHtml, printHtml, exportHtmlToPdf } from '../utils/printUtils.js'

const route = useRoute()
const router = useRouter()
const service = ref<ServiceOrder | null>(null)

const history = ref<ServiceHistory[]>([])
const items = ref<ServiceItem[]>([])
const payments = ref<Payment[]>([])
const parts = ref<Part[]>([])
const photos = ref<Photo[]>([])
const previewImage = ref<string | null>(null)

const updateForm = reactive({
  status: '',
  diagnosis_result: '',
  actions_taken: '',
  technician_notes: ''
})

const itemForm = reactive({
  type: 'Jasa',
  partId: '' as string | number,
  desc: '',
  qty: 1,
  price: 0
})

const paymentForm = reactive({
  amount: 0,
  method: 'Tunai'
})

const isWaModalOpen = ref<boolean>(false)
const waMessage = ref<string>('')

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

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const statusStyle = (status: string) => {
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

const paymentStatusStyle = (status: string) => {
  if (status === 'Lunas') return { color: '#10b981' }
  if (status === 'DP / Sebagian') return { color: '#f59e0b' }
  return { color: '#ef4444' }
}

const loadServiceDetail = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getService) {
      try {
          const detail = (await window.api.getService(id)) as ServiceOrder
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
  const id = route.params.id as string
  if (window.api && window.api.getServiceHistory) {
      history.value = (await window.api.getServiceHistory(id)) as ServiceHistory[]
  }
}

const loadItems = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getServiceItems) {
      items.value = (await window.api.getServiceItems(id)) as ServiceItem[]
  }
}

const loadPayments = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getPayments) {
      payments.value = (await window.api.getPayments(id)) as Payment[]
  }
}

const loadParts = async () => {
  if (window.api && window.api.getParts) {
      parts.value = (await window.api.getParts()) as Part[]
  }
}

const loadPhotos = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getPhotos) {
      photos.value = (await window.api.getPhotos(id)) as Photo[]
  }
}

const handlePhotoUpload = async (e: Event, type: string) => {
    const target = e.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return
    const file = target.files[0]
    
    // Convert to ArrayBuffer
    const buffer = await file.arrayBuffer()
    
    try {
        const result = await window.api.uploadPhoto(service.value?.id, type, buffer, file.name)
        if (result.success) {
            await loadPhotos()
        } else {
            window.Swal.fire('Error', 'Gagal mengunggah foto.', 'error')
        }
    } catch (error: any) {
        window.Swal.fire('Error', error.message || 'Terjadi kesalahan.', 'error')
    }
    target.value = '' // reset input
}

const deletePhoto = async (id: number) => {
    const result = await window.Swal.fire({
        title: 'Hapus foto ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
    })
    if (result.isConfirmed) {
        await window.api.deletePhoto(id)
        await loadPhotos()
    }
}

const saveUpdate = async () => {
  if (!service.value) return
  try {
      const data = {
          diagnosis_result: updateForm.diagnosis_result,
          actions_taken: updateForm.actions_taken,
          technician_notes: updateForm.technician_notes
      }
      await window.api.updateServiceDetails(service.value.id, data)
      
      if (updateForm.status !== service.value.service_status) {
          let warrantyDays = 0
          if (updateForm.status.includes('Selesai')) {
              const { value: days } = await window.Swal.fire({
                  title: 'Atur Garansi',
                  text: 'Berapa hari garansi untuk servis ini? (Isi 0 jika tidak ada)',
                  input: 'number',
                  inputValue: 0,
                  showCancelButton: true,
                  confirmButtonText: 'Simpan',
                  cancelButtonText: 'Batal'
              })
              if (days) {
                  warrantyDays = parseInt(days)
              }
          }
          await window.api.updateServiceStatus(service.value.id, updateForm.status, updateForm.actions_taken || 'Status diupdate', warrantyDays)
      }

      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Detail servis berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false
      })
      await loadServiceDetail()
      await loadHistory()
  } catch (error: any) {
      window.Swal.fire('Error', error.message || 'Gagal menyimpan.', 'error')
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
  if (!service.value) return
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
  } catch (error: any) {
      window.Swal.fire('Error', error.message || 'Gagal menambah item.', 'error')
  }
}

const deleteItem = async (itemId: number) => {
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
  if (!service.value) return
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
  } catch (error: any) {
      window.Swal.fire('Error', error.message || 'Gagal memproses pembayaran.', 'error')
  }
}

const deletePayment = async (paymentId: number) => {
  if (!service.value) return
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

const getCommonData = async () => {
  const settings = (await window.api.getSettings()) as Settings
  const logoBase64 = window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  return { settings, logoBase64 }
}

const sendWhatsApp = () => {
  if (!service.value) return
  const phone = service.value.customer_phone
  if (!phone) {
      return window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
  }
  
  const text = `Halo Kak ${service.value.customer_name},
Perangkat ${service.value.brand || ''} ${service.value.model || ''} dengan No Tiket *${service.value.ticket_number}* saat ini berstatus: *${service.value.service_status}*.
Sisa Tagihan: *${formatCurrency(remainingBill.value)}*.
Terima kasih telah mempercayakan perbaikan kepada kami.`

  waMessage.value = text
  isWaModalOpen.value = true
}

const confirmSendWa = () => {
  if (!service.value) return
  const phone = service.value.customer_phone || ''
  let targetPhone = phone.replace(/^0/, '62')
  
  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMessage.value)}`
  if (window.api && window.api.openExternalUrl) {
      window.api.openExternalUrl(url)
  } else {
      window.open(url, '_blank')
  }
  isWaModalOpen.value = false
}

const exportPdfInvoice = async () => {
  if (!service.value) return
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateInvoiceHtml(settings, service.value, items.value, payments.value, logoBase64)
      const filename = `Invoice_${service.value.ticket_number}_${(service.value.customer_name || '').replace(/\s+/g, '_')}.pdf`
      
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
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Terjadi kesalahan saat memproses PDF.', 'error')
  }
}

const printNota = async () => {
  if (!service.value) return
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateNotaHtml(settings, service.value, logoBase64)
      await printHtml(html, true) // landscape for nota
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal mencetak tanda terima.', 'error')
  }
}

const printThermal = async () => {
  if (!service.value) return
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateThermalNotaHtml(settings, service.value, logoBase64)
      await printHtml(html, false, true) // portrait for thermal, isThermal = true
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal mencetak struk thermal.', 'error')
  }
}

const printReceipt = async () => {
  if (!service.value) return
  try {
      const { settings, logoBase64 } = await getCommonData()
      const html = generateInvoiceHtml(settings, service.value, items.value, payments.value, logoBase64)
      await printHtml(html, false) // portrait for invoice
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal mencetak invoice.', 'error')
  }
}

onMounted(async () => {
  await loadServiceDetail()
  await loadHistory()
  await loadItems()
  await loadPayments()
  await loadParts()
  await loadPhotos()
  
  // Set default payment nominal
  if (remainingBill.value > 0) {
      paymentForm.amount = remainingBill.value
  }
  
  window.addEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault()
      printReceipt()
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
