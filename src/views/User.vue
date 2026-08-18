<template>
  <div class="view-section">
      <div class="action-bar">
          <input type="text" v-model="searchQuery" placeholder="Cari karyawan..." class="search-input">
          <button @click="openAddModal" class="btn btn-primary">Tambah Karyawan</button>
      </div>
      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Peran / Hak Akses</th>
                      <th>Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="u in filteredUsers" :key="u.id">
                      <td>{{ u.id }}</td>
                      <td><strong>{{ u.username }}</strong></td>
                      <td>
                          <span :style="{ background: u.role === 'admin' ? '#4f46e5' : '#10b981', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }">
                              {{ u.role }}
                          </span>
                      </td>
                      <td>
                          <button class="btn btn-sm btn-secondary" @click="editUser(u)">Edit</button>
                          <button v-if="u.id !== currentUserId" class="btn btn-sm btn-danger" @click="deleteUser(u.id)">Hapus</button>
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
                  <form @submit.prevent="saveUser">
                      <div class="form-group">
                          <label>Username</label>
                          <input type="text" v-model="form.username" required>
                      </div>
                      <div class="form-group">
                          <label>Password <small v-if="formId">(Biarkan kosong jika tidak diubah)</small></label>
                          <input type="password" v-model="form.password" :required="!formId">
                      </div>
                      <div class="form-group">
                          <label>Peran / Role</label>
                          <select v-model="form.role" required>
                              <option value="admin">Admin</option>
                              <option value="teknisi">Teknisi / Staff</option>
                          </select>
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
import { ref, reactive, computed, onMounted } from 'vue'

const users = ref([])
const searchQuery = ref('')
const currentUserId = ref(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
})

const loadUsers = async () => {
  if (window.api && window.api.getUsers) {
      try {
          const userStr = localStorage.getItem('nunox_user')
          if (userStr) {
              const u = JSON.parse(userStr)
              currentUserId.value = u.id
          }
          users.value = await window.api.getUsers()
      } catch (error) {
          console.error(error)
      }
  }
}

// Modal Form Logic
const isModalOpen = ref(false)
const modalTitle = ref('Tambah Karyawan')
const formId = ref(null)
const form = reactive({
  username: '',
  password: '',
  role: 'teknisi'
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Karyawan'
  formId.value = null
  form.username = ''
  form.password = ''
  form.role = 'teknisi'
  isModalOpen.value = true
}

const editUser = async (u) => {
  try {
      const detail = await window.api.getUser(u.id)
      if (detail) {
          modalTitle.value = 'Edit Karyawan'
          formId.value = detail.id
          form.username = detail.username
          form.password = ''
          form.role = detail.role
          isModalOpen.value = true
      }
  } catch (error) {
      console.error(error)
  }
}

const saveUser = async () => {
  try {
      if (formId.value) {
          const res = await window.api.updateUser(formId.value, { ...form })
          if (res.success) {
              isModalOpen.value = false
              loadUsers()
          } else {
              window.Swal.fire('Error', res.error || 'Gagal menyimpan.', 'error')
          }
      } else {
          const res = await window.api.addUser({ ...form })
          if (res.success) {
              isModalOpen.value = false
              loadUsers()
          } else {
              window.Swal.fire('Error', res.error || 'Gagal menyimpan.', 'error')
          }
      }
  } catch (error) {
      console.error(error)
  }
}

const deleteUser = async (id) => {
  const result = await window.Swal.fire({
      title: 'Hapus Karyawan?',
      text: "Yakin ingin menghapus karyawan ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus'
  })

  if (result.isConfirmed) {
      try {
          const res = await window.api.deleteUser(id)
          if (res.success) {
              window.Swal.fire('Terhapus!', 'Karyawan berhasil dihapus.', 'success')
              loadUsers()
          } else {
              window.Swal.fire('Error', res.error || 'Gagal menghapus.', 'error')
          }
      } catch (error) {
          console.error(error)
      }
  }
}

onMounted(() => {
  loadUsers()
})
</script>
