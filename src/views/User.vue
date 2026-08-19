<template>
  <div class="view-section">
      <div class="action-bar" style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
          <div style="position: relative; flex: 1; max-width: 400px;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
              <input type="text" v-model="searchQuery" placeholder="Cari karyawan..." class="search-input" style="width: 100%; padding-left: 35px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
          </div>
          <button @click="openAddModal" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <span>➕</span> Tambah Karyawan
          </button>
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
                          <span class="badge" :style="{ background: u.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: u.role === 'admin' ? '#4f46e5' : '#10b981', border: u.role === 'admin' ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)' }">
                              {{ u.role.toUpperCase() }}
                          </span>
                      </td>
                      <td>
                          <button class="btn btn-sm btn-secondary" @click="editUser(u)">✏️ Edit</button>
                          <button v-if="u.id !== currentUserId" class="btn btn-sm btn-danger" @click="deleteUser(u.id)">🗑️ Hapus</button>
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
                          <input type="text" v-model="form.username" required placeholder="Masukkan username" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                      </div>
                      <div class="form-group">
                          <label>Password <small v-if="formId" style="color: var(--text-muted);">(Biarkan kosong jika tidak diubah)</small></label>
                          <input type="password" v-model="form.password" :required="!formId" placeholder="Masukkan password" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                      </div>
                      <div class="form-group">
                          <label>Peran / Role</label>
                          <select v-model="form.role" required style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; width: 100%;">
                              <option value="admin">Admin</option>
                              <option value="teknisi">Teknisi / Staff</option>
                          </select>
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
import { ref, reactive, computed, onMounted } from 'vue'
import type { User } from '../types'

const users = ref<User[]>([])
const searchQuery = ref<string>('')
const currentUserId = ref<number | null>(null)

const filteredUsers = computed<User[]>(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
})

const loadUsers = async () => {
  if (window.api && window.api.getUsers) {
      try {
          const userStr = localStorage.getItem('nunox_user')
          if (userStr) {
              const u = JSON.parse(userStr) as User
              currentUserId.value = u.id || null
          }
          users.value = (await window.api.getUsers()) as User[]
      } catch (error) {
          console.error(error)
      }
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Karyawan')
const formId = ref<number | null>(null)
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

const editUser = async (u: User) => {
  try {
      const detail = (await window.api.getUser(u.id)) as User
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

const deleteUser = async (id: number) => {
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
