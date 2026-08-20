<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
          <div style="position: relative; flex: 1; max-width: 400px;">
              <Search class="search-icon" :size="18" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; color: var(--text-primary);" />
              <input type="text" v-model="searchQuery" @input="debounceSearch" placeholder="Cari perangkat..." class="form-control" style="width: 100%; padding-left: 38px; border-radius: 20px;">
          </div>
          <button @click="openAddModal" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <Plus :size="18" /> Tambah Perangkat
          </button>
      </div>
      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Pelanggan</th>
                      <th>Merek / Model</th>
                      <th>Tipe</th>
                      <th>SN</th>
                      <th>Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-if="devices.length === 0">
                      <td colspan="6" style="text-align: center; padding: 20px;">Belum ada data perangkat.</td>
                  </tr>
                  <tr v-for="d in devices" :key="d.id">
                      <td>{{ d.id }}</td>
                      <td>{{ d.customer_name }}</td>
                      <td>{{ d.brand || '-' }} / {{ d.model || '-' }}</td>
                      <td>{{ d.device_type }}</td>
                      <td>{{ d.serial_number || '-' }}</td>
                      <td>
                          <button class="btn btn-secondary btn-sm" @click="editDevice(d)">✏️ Edit</button>
                          <button class="btn btn-danger btn-sm" @click="deleteDevice(d.id)">🗑️ Hapus</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>

      <!-- Custom Pagination -->
      <div class="pagination-controls" style="margin-top: 25px; display: flex; justify-content: center; gap: 15px; align-items: center;">
          <button class="btn btn-secondary btn-sm" :disabled="currentPage === 1" @click="loadDevices(currentPage - 1)" style="border-radius: 20px; padding: 6px 16px;">&larr; Sebelumnya</button>
          <span style="font-weight: 500; color: var(--text-muted); background: var(--card-bg); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border-color);">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <button class="btn btn-secondary btn-sm" :disabled="currentPage >= totalPages" @click="loadDevices(currentPage + 1)" style="border-radius: 20px; padding: 6px 16px;">Selanjutnya &rarr;</button>
      </div>

      <!-- Modal Tambah/Edit -->
      <div v-if="isModalOpen" class="modal show">
          <div class="modal-content">
              <div class="modal-header">
                  <h2>{{ modalTitle }}</h2>
                  <span class="close-modal" @click="isModalOpen = false">&times;</span>
              </div>
              <div class="modal-body">
                  <form @submit.prevent="saveDevice">
                      <div class="form-group">
                          <label>Pelanggan</label>
                          <select v-model="form.customer_id" required style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                              <option value="">-- Pilih Pelanggan --</option>
                              <option v-for="c in customers" :key="c.id" :value="c.id">
                                  {{ c.name }} ({{ c.phone || '-' }})
                              </option>
                          </select>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Merek (Brand)</label>
                              <input type="text" v-model="form.brand" placeholder="Misal: Samsung, Asus" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Model</label>
                              <input type="text" v-model="form.model" placeholder="Misal: Galaxy S21" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Tipe Perangkat</label>
                              <input type="text" v-model="form.device_type" required placeholder="Misal: Smartphone, Laptop" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Serial Number (SN)</label>
                              <input type="text" v-model="form.serial_number" placeholder="Opsional" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Kondisi Fisik Saat Diterima</label>
                          <textarea v-model="form.physical_condition" rows="2" placeholder="Contoh: Ada goresan di bodi, layar retak sedikit..." style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%; resize: vertical;"></textarea>
                      </div>
                      <div class="form-group">
                          <label>Catatan Tambahan</label>
                          <textarea v-model="form.notes" rows="2" placeholder="Informasi lain..." style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%; resize: vertical;"></textarea>
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
import { Search, Plus } from 'lucide-vue-next'
import { ref, reactive, onMounted, computed } from 'vue'
import type { Device, Customer } from '../types'

const devices = ref<Device[]>([])
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
    loadDevices(1)
  }, 300)
}

const loadDevices = async (page: number = 1) => {
  if (window.api && window.api.getDevices) {
      try {
          const result = await window.api.getDevices(searchQuery.value, page, itemsPerPage)
          // Adjust based on how getDevices actually returns. Assuming it returns { data, total, page } like Customer
          if (Array.isArray(result)) {
              devices.value = result as Device[]
          } else {
              devices.value = (result.data as Device[]) || []
              totalItems.value = result.total || 0
              currentPage.value = result.page || 1
          }
      } catch (error) {
          console.error("Failed to load devices:", error)
      }
  }
}

const loadCustomersDropdown = async () => {
  if (window.api && window.api.getCustomers) {
      const result = await window.api.getCustomers('', 1, 1000)
      customers.value = (result.data as Customer[]) || []
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Perangkat')
const formId = ref<number | null>(null)
const form = reactive({
  customer_id: '',
  device_type: 'Laptop',
  brand: '',
  model: '',
  serial_number: '',
  color: '',
  accessories: '',
  physical_condition: '',
  notes: ''
})

const openAddModal = async () => {
  modalTitle.value = 'Tambah Perangkat'
  formId.value = null
  form.customer_id = ''
  form.device_type = 'Laptop'
  form.brand = ''
  form.model = ''
  form.serial_number = ''
  form.color = ''
  form.accessories = ''
  form.physical_condition = ''
  form.notes = ''
  
  await loadCustomersDropdown()
  isModalOpen.value = true
}

const editDevice = async (d: Device) => {
  try {
      const detail = (await window.api.getDevice(d.id)) as Device
      if (detail) {
          modalTitle.value = 'Edit Perangkat'
          formId.value = detail.id || null
          
          await loadCustomersDropdown()

          form.customer_id = detail.customer_id.toString()
          form.device_type = detail.device_type || ''
          form.brand = detail.brand || ''
          form.model = detail.model || ''
          form.serial_number = detail.serial_number || ''
          form.color = detail.color || ''
          form.accessories = detail.accessories || ''
          form.physical_condition = detail.physical_condition || ''
          form.notes = detail.notes || ''
          
          isModalOpen.value = true
      }
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal memuat detail perangkat.', 'error')
  }
}

const saveDevice = async () => {
  try {
      if (formId.value) {
          await window.api.updateDevice(formId.value, { ...form })
      } else {
          await window.api.addDevice({ ...form })
      }
      isModalOpen.value = false
      loadDevices(currentPage.value)
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Data perangkat berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error: any) {
      console.error(error)
      window.Swal.fire('Error', error.message || 'Gagal menyimpan perangkat.', 'error')
  }
}

const deleteDevice = async (id: number) => {
  const result = await window.Swal.fire({
      title: 'Hapus Perangkat?',
      text: "Apakah Anda yakin ingin menghapus perangkat ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
      try {
          await window.api.deleteDevice(id)
          window.Swal.fire('Terhapus!', 'Perangkat berhasil dihapus.', 'success')
          loadDevices(currentPage.value)
      } catch (error: any) {
          window.Swal.fire('Error', error.message || 'Gagal menghapus.', 'error')
      }
  }
}

onMounted(() => {
  loadDevices()
})
</script>
