<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
          <div style="position: relative; flex: 1; max-width: 400px;">
              <Search class="search-icon" :size="18" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; color: var(--text-primary);" />
              <input type="text" v-model="searchQuery" @input="debounceSearch" placeholder="Cari pelanggan (Nama / HP)..." class="form-control" style="width: 100%; padding-left: 38px; border-radius: 20px;">
          </div>
          <button @click="openAddModal" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <Plus :size="18" /> Tambah Pelanggan
          </button>
      </div>
      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>No. HP</th>
                      <th>Alamat</th>
                      <th>Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-if="customers.length === 0">
                      <td colspan="5" style="text-align: center; padding: 20px;">Belum ada data pelanggan.</td>
                  </tr>
                  <tr v-for="c in customers" :key="c.id">
                      <td>{{ c.id }}</td>
                      <td>{{ c.name }}</td>
                      <td>{{ c.phone || '-' }}</td>
                      <td>{{ c.address || '-' }}</td>
                      <td>
                          <button class="btn btn-secondary btn-sm" @click="editCustomer(c)" style="display: inline-flex; align-items: center; gap: 6px;"><Edit :size="14" /> Edit</button>
                          <button class="btn btn-danger btn-sm" @click="deleteCustomer(c.id)" style="display: inline-flex; align-items: center; gap: 6px;"><Trash2 :size="14" /> Hapus</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
      
      <!-- Custom Pagination -->
      <div class="pagination-controls" style="margin-top: 25px; display: flex; justify-content: center; gap: 15px; align-items: center;">
          <button class="btn btn-secondary btn-sm" :disabled="currentPage === 1" @click="loadCustomers(currentPage - 1)" style="border-radius: 20px; padding: 6px 16px;">&larr; Sebelumnya</button>
          <span style="font-weight: 500; color: var(--text-muted); background: var(--card-bg); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border-color);">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <button class="btn btn-secondary btn-sm" :disabled="currentPage >= totalPages" @click="loadCustomers(currentPage + 1)" style="border-radius: 20px; padding: 6px 16px;">Selanjutnya &rarr;</button>
      </div>

      <!-- Modal Tambah/Edit -->
      <div v-if="isModalOpen" class="modal show">
          <div class="modal-content">
              <div class="modal-header">
                  <h2>{{ modalTitle }}</h2>
                  <span class="close-modal" @click="isModalOpen = false">&times;</span>
              </div>
              <div class="modal-body">
                  <form @submit.prevent="saveCustomer">
                      <div class="form-group">
                          <label>Nama Lengkap</label>
                          <input type="text" v-model="form.name" required placeholder="Contoh: Budi Santoso" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px;">
                      </div>
                      <div class="form-group">
                          <label>No. HP/WhatsApp</label>
                          <input type="text" v-model="form.phone" placeholder="Contoh: 08123456789" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px;">
                      </div>
                      <div class="form-group">
                          <label>Alamat</label>
                          <textarea v-model="form.address" rows="3" placeholder="Alamat lengkap" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; resize: vertical;"></textarea>
                      </div>
                      <div class="form-group">
                          <label>Catatan Tambahan</label>
                          <textarea v-model="form.notes" rows="2" placeholder="Catatan internal..." style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; resize: vertical;"></textarea>
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
import { Search, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted } from 'vue'
import type { Customer } from '../types'

const customers = ref<Customer[]>([])
const searchQuery = ref<string>('')
const currentPage = ref<number>(1)
const itemsPerPage = 50
const totalItems = ref<number>(0)
const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCustomers(1)
  }, 300)
}

const loadCustomers = async (page: number = 1) => {
  if (window.api && window.api.getCustomers) {
      try {
          const result = await window.api.getCustomers(searchQuery.value, page, itemsPerPage)
          customers.value = (result.data as Customer[]) || []
          totalItems.value = result.total || 0
          currentPage.value = result.page || 1
      } catch (error) {
          console.error("Failed to load customers:", error)
      }
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Pelanggan')
const formId = ref<number | null>(null)
const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Pelanggan'
  formId.value = null
  form.name = ''
  form.phone = ''
  form.address = ''
  form.notes = ''
  isModalOpen.value = true
}

const editCustomer = async (c: Customer) => {
  try {
      const detail = (await window.api.getCustomer(c.id)) as Customer
      if (detail) {
          modalTitle.value = 'Edit Pelanggan'
          formId.value = detail.id || null
          form.name = detail.name || ''
          form.phone = detail.phone || ''
          form.address = detail.address || ''
          form.notes = detail.notes || ''
          isModalOpen.value = true
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal memuat detail pelanggan.', 'error')
  }
}

const saveCustomer = async () => {
  try {
      if (formId.value) {
          await window.api.updateCustomer(formId.value, { ...form })
      } else {
          await window.api.addCustomer({ ...form })
      }
      isModalOpen.value = false
      loadCustomers(currentPage.value)
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Data pelanggan berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal menyimpan data pelanggan.', 'error')
  }
}

const deleteCustomer = async (id: number) => {
  const result = await window.Swal.fire({
      title: 'Hapus Pelanggan?',
      text: "Data tidak dapat dikembalikan! Semua perangkat terkait mungkin tidak bisa dihapus jika memiliki riwayat servis.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
      try {
          await window.api.deleteCustomer(id)
          window.Swal.fire('Terhapus!', 'Pelanggan berhasil dihapus.', 'success')
          loadCustomers(currentPage.value)
      } catch (error: any) {
          window.Swal.fire('Error', error.message || 'Gagal menghapus.', 'error')
      }
  }
}

onMounted(() => {
  loadCustomers()
})
</script>
