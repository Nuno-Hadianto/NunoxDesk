<template>
  <div v-if="!isLoggedIn" class="login-screen fade-in">
    <div class="login-card">
        <h2>🔧 nuNox<span class="brand-accent">Servis</span></h2>
        <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group" style="text-align: left;">
                <label>Username</label>
                <input type="text" class="form-control" v-model="loginForm.username" required autocomplete="off" placeholder="Masukkan username">
            </div>
            <div class="form-group" style="text-align: left;">
                <label>Password</label>
                <input type="password" class="form-control" v-model="loginForm.password" required autocomplete="off" placeholder="Masukkan password">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Masuk</button>
        </form>
        <p style="margin-top: 25px; font-size: 0.85rem; color: var(--text-muted);">Default admin: admin / admin123</p>
    </div>
  </div>

  <div v-else class="app-container show">
    <!-- Sidebar -->
    <Sidebar :currentUser="currentUser || undefined" @logout="handleLogout" />

    <!-- Main Content -->
    <main class="main-content">
        <Topbar :title="pageTitle" @toggle-theme="toggleTheme" />

        <div class="content-area">
            <!-- Router View render halaman yang aktif -->
            <router-view></router-view>
        </div>
    </main>
  </div>

  <div id="print-area"></div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import type { User } from './types'

const router = useRouter()
const route = useRoute()

let initialUser: User | null = null
try {
  const savedUser = localStorage.getItem('nunox_user')
  if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    initialUser = JSON.parse(savedUser) as User
  }
} catch (e) {
  console.error('Failed to parse user from localStorage', e)
  localStorage.removeItem('nunox_user')
}

const isLoggedIn = ref<boolean>(!!initialUser)
const currentUser = ref<User | null>(initialUser)

const loginForm = reactive({
  username: '',
  password: ''
})

const pageTitle = computed<string>(() => {
  return (route.meta.title as string) || 'nuNox_servis'
})

onMounted(() => {
  if (window.api && window.api.appReady) {
    window.api.appReady()
  }
})

const handleLogin = async () => {
  try {
    const user = await window.api.login(loginForm.username, loginForm.password)
    if (user) {
      currentUser.value = user
      isLoggedIn.value = true
      localStorage.setItem('nunox_user', JSON.stringify(user))
      
      // Auto-login SweetAlert
      window.Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang, ${user.username}!`,
          timer: 1500,
          showConfirmButton: false
      })
      router.push('/')
    }
  } catch (error: any) {
    window.Swal.fire('Error', error.message || 'Login gagal', 'error')
  }
}

const handleLogout = () => {
  localStorage.removeItem('nunox_user')
  currentUser.value = null
  isLoggedIn.value = false
  loginForm.username = ''
  loginForm.password = ''
  router.push('/')
}

const toggleTheme = () => {
  document.body.classList.toggle('dark-mode')
}
</script>

<style>
/* Global styles handled by style.css which we'll copy to public */
</style>
