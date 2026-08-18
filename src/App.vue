<template>
  <div v-if="!isLoggedIn" class="login-screen show">
    <div class="login-card">
        <h2>nuNox Servis</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label>Username</label>
                <input type="text" v-model="loginForm.username" required autocomplete="off" placeholder="Masukkan username">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" v-model="loginForm.password" required autocomplete="off" placeholder="Masukkan password">
            </div>
            <button type="submit" class="btn btn-primary" style="background-color: #4f46e5;">Masuk</button>
        </form>
        <p style="margin-top: 15px; font-size: 0.8rem; color: #94a3b8;">Default admin: admin / admin123</p>
    </div>
  </div>

  <div v-else class="app-container show">
    <!-- Sidebar -->
    <Sidebar :currentUser="currentUser" @logout="handleLogout" />

    <!-- Main Content -->
    <main class="main-content">
        <Topbar :title="pageTitle" @toggle-theme="toggleTheme" />

        <div class="content-area">
            <!-- Router View render halaman yang aktif -->
            <router-view></router-view>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'

const router = useRouter()
const route = useRoute()

const isLoggedIn = ref(false)
const currentUser = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const pageTitle = computed(() => {
  return route.meta.title || 'nuNox_servis'
})

onMounted(() => {
  // Check auth status from localStorage
  const savedUser = localStorage.getItem('nunox_user')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    isLoggedIn.value = true
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
  } catch (error) {
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
