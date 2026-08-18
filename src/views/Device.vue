<template>
  <div class="view-section">
      <div class="action-bar">
          <input type="text" v-model="searchQuery" @input="debounceSearch" placeholder="Cari perangkat..." class="search-input">
          <button @click="openAddModal" class="btn btn-primary">Tambah Perangkat</button>
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
                          <button class="btn btn-secondary btn-sm" @click="editDevice(d)">Edit</button>
                          <button class="btn btn-danger btn-sm" @click="deleteDevice(d.id)">Hapus</button>
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
                  <form @submit.prevent="saveDevice">
                      <div class="form-group">
                          <label>Pemilik (Pelanggan)</label>
                          <select v-model="form.customer_id" required>
                              <option value="">-- Pilih Pelanggan --</option>
                              <option v-for="c in customers" :key="c.id" :value="c.id">
                                  {{ c.name }} ({{ c.phone || '-' }})
                              </option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label>Tipe Perangkat</label>
                          <select v-model="form.device_type" required>
                              <option value="Laptop">Laptop</option>
                              <option value="PC Desktop">PC Desktop</option>
                              <option value="Printer">Printer</option>
                              <option value="Smartphone">Smartphone</option>
                              <option value="Lainnya">Lainnya</option>
                          </select>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Merek</label>
                              <input type="text" v-model="form.brand" placeholder="Contoh: Asus">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Model / Seri</label>
                              <input type="text" v-model="form.model" placeholder="Contoh: ROG Strix">
                          </div>
                      </div>
                      <div style="display: flex; gap: 15px;">
                          <div class="form-group" style="flex: 1;">
                              <label>Serial Number (SN)</label>
                              <input type="text" v-model="form.serial_number" placeholder="SN Perangkat">
                          </div>
                          <div class="form-group" style="flex: 1;">
                              <label>Warna</label>
                              <input type="text" v-model="form.color" placeholder="Warna">
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Kelengkapan (Bawaan pelanggan)</label>
                          <input type="text" v-model="form.accessories" placeholder="Contoh: Tas, Charger, Mouse">
                      </div>
                      <div class="form-group">
                          <label>Kondisi Fisik Saat Diterima</label>
                          <textarea v-model="form.physical_condition" rows="2" placeholder="Contoh: Ada goresan di bodi, layar retak sedikit..."></textarea>
                      </div>
                      <div class="form-group">
                          <label>Catatan Tambahan</label>
                          <textarea v-model="form.notes" rows="2" placeholder="Informasi lain..."></textarea>
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

const devices = ref([])
const customers = ref([])
const searchQuery = ref('')

let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDevices()
  }, 300)
}

const loadDevices = async () => {
  if (window.api && window.api.getDevices) {
      try {
          devices.value = await window.api.getDevices(searchQuery.value)
      } catch (error) {
          console.error("Failed to load devices:", error)
      }
  }
}

const loadCustomersDropdown = async () => {
  if (window.api && window.api.getCustomers) {
      const result = await window.api.getCustomers('', 1, 1000)
      customers.value = result.data || []
  }
}

// Modal Form Logic
const isModalOpen = ref(false)
const modalTitle = ref('Tambah Perangkat')
const formId = ref(null)
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

const editDevice = async (d) => {
  try {
      const detail = await window.api.getDevice(d.id)
      if (detail) {
          modalTitle.value = 'Edit Perangkat'
          formId.value = detail.id
          
          await loadCustomersDropdown()

          form.customer_id = detail.customer_id
          form.device_type = detail.device_type
          form.brand = detail.brand
          form.model = detail.model
          form.serial_number = detail.serial_number
          form.color = detail.color
          form.accessories = detail.accessories
          form.physical_condition = detail.physical_condition
          form.notes = detail.notes
          
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
      loadDevices()
      window.Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Data perangkat berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
      })
  } catch (error) {
      console.error(error)
      window.Swal.fire('Error', 'Gagal menyimpan data perangkat.', 'error')
  }
}

const deleteDevice = async (id) => {
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
          loadDevices()
      } catch (error) {
          window.Swal.fire('Error', error.message || 'Gagal menghapus.', 'error')
      }
  }
}

onMounted(() => {
  loadDevices()
})
</script>
