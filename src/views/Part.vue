<template>
  <div class="view-section">
      <div class="action-bar">
          <input type="text" v-model="searchQuery" @input="debounceSearch" placeholder="Cari sparepart (Kode / Nama)..." class="search-input">
          <div style="display: flex; gap: 10px;">
              <button @click="importExcel" class="btn btn-secondary">📥 Import Excel</button>
              <button @click="openAddModal" class="btn btn-primary">Tambah Sparepart</button>
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
                          <span :style="p.stock <= 5 ? 'color: #ef4444; font-weight: bold;' : ''">
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
                              <input type="text" v-model="form.part_code" placeholder="Contoh: LCD-IP-11">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Kategori</label>
                              <input type="text" v-model="form.category" placeholder="Contoh: LCD, Baterai...">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Nama Sparepart</label>
                          <input type="text" v-model="form.name" required placeholder="Nama barang">
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Stok Awal</label>
                              <input type="number" v-model.number="form.stock" required min="0">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Satuan</label>
                              <input type="text" v-model="form.unit" placeholder="Pcs, Unit...">
                          </div>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Harga Beli / Modal (Rp)</label>
                              <input type="number" v-model.number="form.buy_price" required min="0">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Harga Jual (Rp)</label>
                              <input type="number" v-model.number="form.sell_price" required min="0">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Catatan Tambahan</label>
                          <textarea v-model="form.notes" rows="2"></textarea>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary close-modal" @click="isModalOpen = false">Batal</button>
                          <button type="submit" class="btn btn-primary">Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const parts = ref([])
const searchQuery = ref('')

let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadParts()
  }, 300)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
  }).format(amount || 0)
}

const loadParts = async () => {
  if (window.api && window.api.getParts) {
      try {
          parts.value = await window.api.getParts(searchQuery.value)
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
const isModalOpen = ref(false)
const modalTitle = ref('Tambah Sparepart')
const formId = ref(null)
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

const editPart = async (p) => {
  try {
      const detail = await window.api.getPart(p.id)
      if (detail) {
          modalTitle.value = 'Edit Sparepart'
          formId.value = detail.id
          form.part_code = detail.part_code
          form.name = detail.name
          form.category = detail.category
          form.stock = detail.stock
          form.buy_price = detail.buy_price
          form.sell_price = detail.sell_price
          form.unit = detail.unit
          form.notes = detail.notes
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
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal menyimpan data sparepart.', 'error')
  }
}

const deletePart = async (id) => {
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
      } catch (error) {
          window.Swal.fire('Error', error.message || 'Gagal menghapus.', 'error')
      }
  }
}

onMounted(() => {
  loadParts()
})

const importExcel = async () => {
  try {
      const result = await window.api.importPartsExcel()
      if (result && result.success) {
          window.Swal.fire({
              icon: 'success',
              title: 'Import Berhasil',
              text: `${result.count} data sparepart berhasil diimport.`,
              timer: 2000,
              showConfirmButton: false
          })
          loadParts()
      } else if (result && !result.canceled) {
          window.Swal.fire('Error', result.error || 'Gagal import Excel.', 'error')
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Terjadi kesalahan saat import.', 'error')
  }
}
</script>
