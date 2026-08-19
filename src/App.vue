<template>
  <div v-if="!isLoggedIn" class="login-screen show" style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1e293b, #0f172a);">
    <div class="login-card" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 40px; border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; max-width: 400px; text-align: center;">
        <h2 style="color: white; font-size: 1.8rem; margin-bottom: 30px; font-weight: 700;">🔧 nuNox<span style="color: #6366f1;">Servis</span></h2>
        <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group" style="text-align: left;">
                <label style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 8px; display: block;">Username</label>
                <input type="text" v-model="loginForm.username" required autocomplete="off" placeholder="Masukkan username" style="width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); color: white; outline: none; transition: border-color 0.3s;">
            </div>
            <div class="form-group" style="text-align: left;">
                <label style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 8px; display: block;">Password</label>
                <input type="password" v-model="loginForm.password" required autocomplete="off" placeholder="Masukkan password" style="width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); color: white; outline: none; transition: border-color 0.3s;">
            </div>
            <button type="submit" class="btn btn-primary" style="background-color: #6366f1; width: 100%; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 1rem; margin-top: 10px; transition: background-color 0.3s; border: none;">Masuk</button>
        </form>
        <p style="margin-top: 25px; font-size: 0.85rem; color: #64748b;">Default admin: admin / admin123</p>
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

interface User {
  id?: number;
  username: string;
  role: string;
}

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
