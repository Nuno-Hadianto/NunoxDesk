<template>
  <div v-if="!isLoggedIn" class="login-screen fade-in">
    <div class="login-card">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-bottom: 25px;">
            <img src="/img/logo.png" alt="nuNox_servis Logo" style="width: 100%; max-width: 280px; height: auto; object-fit: contain;" />
            <h2 style="margin: 0; color: var(--text-primary); font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;">nuNox_<span style="color: var(--primary);">servis</span></h2>
        </div>
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
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
        <Topbar :title="pageTitle" @toggle-theme="toggleTheme" />

        <div class="content-area">
            <!-- Router View render halaman yang aktif -->
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </main>
  </div>

  <div id="print-area"></div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import { Toast } from './utils/toast'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import type { User } from './types'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const { isLoggedIn, currentUser } = storeToRefs(authStore)

const loginForm = reactive({
  username: '',
  password: ''
})

const pageTitle = computed<string>(() => {
  return (route.meta.title as string) || 'nuNox_servis'
})

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    const closeBtn = document.querySelector('.modal.show .close-modal') as HTMLElement
    if (closeBtn) closeBtn.click()
  }
}

onMounted(() => {
  if (window.api && window.api.appReady) {
    window.api.appReady()
  }
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

const handleLogin = async () => {
  try {
    const user = await window.api.login(loginForm.username, loginForm.password)
    if (user) {
      authStore.login(user)
      
      // Auto-login SweetAlert
      Toast.fire({
          icon: 'success',
          title: `Selamat datang, ${user.username}!`
      })
      router.push('/')
    }
  } catch (error: any) {
    window.Swal.fire('Error', error.message || 'Login gagal', 'error')
  }
}

const handleLogout = () => {
  authStore.logout()
  loginForm.username = ''
  loginForm.password = ''
  router.push('/')
}

const toggleTheme = () => {
  document.body.classList.toggle('dark-mode')
}
</script>

<style>
/* Global styles handled by style.css */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
