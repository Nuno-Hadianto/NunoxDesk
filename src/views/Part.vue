<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; justify-content: space-between;">
          <div style="position: relative; flex: 1; min-width: 250px; max-width: 400px;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
              <input type="text" v-model="searchQuery" @input="debounceSearch" placeholder="Cari sparepart (Kode / Nama)..." class="search-input" style="width: 100%; padding-left: 35px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button @click="importExcel" class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  <span>📥</span> Import Excel
              </button>
              <button @click="openAddModal" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; border-radius: 20px;">
                  <span>➕</span> Tambah Sparepart
              </button>
          </div>
      </div>
      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>Kode</th>
                      <th>Nama Sparepart</th>
                      <th>Kategori</th>
                      <th>Stok</th>
                      <th>Harga Jual</th>
                      <th>Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-if="parts.length === 0">
                      <td colspan="6" style="text-align: center; padding: 20px;">Belum ada data sparepart.</td>
                  </tr>
                  <tr v-for="p in parts" :key="p.id">
                      <td>{{ p.part_code || '-' }}</td>
                      <td>{{ p.name }}</td>
                      <td>{{ p.category || '-' }}</td>
                      <td>
                          <span v-if="p.stock <= 5" class="badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
                              ⚠️ {{ p.stock }} {{ p.unit || '' }}
                          </span>
                          <span v-else>
                              {{ p.stock }} {{ p.unit || '' }}
                          </span>
                      </td>
                      <td>{{ formatCurrency(p.sell_price) }}</td>
                      <td>
                          <button class="btn btn-secondary btn-sm" @click="editPart(p)">Edit</button>
                          <button class="btn btn-danger btn-sm" @click="deletePart(p.id)">Hapus</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>

      <!-- Modal Tambah/Edit -->
      <div v-if="isModalOpen" class="modal show">
          <div class="modal-content">
              <div class="modal-header">
                  <h2>{{ modalTitle }}</h2>
                  <span class="close-modal" @click="isModalOpen = false">&times;</span>
              </div>
              <div class="modal-body">
                  <form @submit.prevent="savePart">
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Kode Barang (Opsional)</label>
                              <input type="text" v-model="form.part_code" placeholder="Contoh: LCD-IP-11" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Kategori</label>
                              <input type="text" v-model="form.category" placeholder="Contoh: LCD, Baterai..." style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Nama Sparepart</label>
                          <input type="text" v-model="form.name" required placeholder="Nama barang" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Stok Awal</label>
                              <input type="number" v-model.number="form.stock" required min="0" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Satuan</label>
                              <input type="text" v-model="form.unit" placeholder="Pcs, Unit..." style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Harga Beli / Modal (Rp)</label>
                              <input type="number" v-model.number="form.buy_price" required min="0" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Harga Jual (Rp)</label>
                              <input type="number" v-model.number="form.sell_price" required min="0" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Catatan Tambahan</label>
                          <textarea v-model="form.notes" rows="2" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%; resize: vertical;"></textarea>
                      </div>
                      <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                          <button type="button" class="btn btn-secondary close-modal" @click="isModalOpen = false" style="padding: 8px 20px;">Batal</button>
                          <button type="submit" class="btn btn-primary" style="padding: 8px 20px;">💾 Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Part } from '../types'

const parts = ref<Part[]>([])
const searchQuery = ref<string>('')

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadParts()
  }, 300)
}

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const loadParts = async () => {
  if (window.api && window.api.getParts) {
      try {
          parts.value = (await window.api.getParts(searchQuery.value)) as Part[]
      } catch (error) {
          console.error("Failed to load parts:", error)
      }
  }
}

const importExcel = async () => {
  try {
      const res = await window.api.importPartsExcel()
      if (res.canceled) return
      
      if (res.success) {
          window.Swal.fire('Berhasil', `Import: ${res.result.imported} baru, ${res.result.updated} diperbarui.`, 'success')
          loadParts()
      } else {
          window.Swal.fire('Gagal', res.error || 'Terjadi kesalahan saat import.', 'error')
      }
  } catch (err) {
      console.error(err)
      window.Swal.fire('Error', 'Gagal memproses file Excel.', 'error')
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Sparepart')
const formId = ref<number | null>(null)
const form = reactive({
  part_code: '',
  name: '',
  category: '',
  stock: 0,
  buy_price: 0,
  sell_price: 0,
  unit: 'Pcs',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Sparepart'
  formId.value = null
  form.part_code = ''
  form.name = ''
  form.category = ''
  form.stock = 0
  form.buy_price = 0
  form.sell_price = 0
  form.unit = 'Pcs'
  form.notes = ''
  isModalOpen.value = true
}

const editPart = async (p: Part) => {
  try {
      const detail = (await window.api.getPart(p.id)) as Part
      if (detail) {
          modalTitle.value = 'Edit Sparepart'
          formId.value = detail.id || null
          form.part_code = detail.part_code || ''
          form.name = detail.name || ''
          form.category = detail.category || ''
          form.stock = detail.stock || 0
          form.buy_price = detail.buy_price || 0
          form.sell_price = detail.sell_price || 0
          form.unit = detail.unit || ''
          form.notes = detail.notes || ''
          isModalOpen.value = true
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal memuat detail sparepart.', 'error')
  }
}

const savePart = async () => {
  try {
      if (formId.value) {
          await window.api.updatePart(formId.value, { ...form })
      } else {
          await window.api.addPart({ ...form })
      }
      isModalOpen.value = false
      loadParts()
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Data sparepart berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal menyimpan data.', 'error')
  }
}

const deletePart = async (id: number) => {
  const result = await window.Swal.fire({
      title: 'Hapus Sparepart?',
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
      try {
          await window.api.deletePart(id)
          window.Swal.fire('Terhapus!', 'Sparepart berhasil dihapus.', 'success')
          loadParts()
      } catch (error: any) {
          window.Swal.fire('Error', error.message || 'Gagal menghapus.', 'error')
      }
  }
}

onMounted(() => {
  loadParts()
})

</script>
