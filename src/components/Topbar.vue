<template>
  <header class="topbar">
      <div class="topbar-title" style="display: flex; align-items: center; gap: 20px;">
          <h1>{{ title }}</h1>
          <div class="global-search-container" style="position: relative;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
              <input 
                  type="text" 
                  class="global-search-input" 
                  placeholder="Cari (Ctrl + K)..." 
                  ref="searchInput"
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
              >
          </div>
      </div>
      <div class="topbar-actions" style="display: flex; align-items: center; gap: 15px;">
          <div class="badge" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); font-weight: 500; font-size: 0.9rem; padding: 8px 16px;">
              🕒 {{ currentDateTime }}
          </div>
          <button @click="toggleTheme" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 1.2rem; transition: var(--transition);">
              <span v-if="isDark">☀️</span>
              <span v-else>🌙</span>
          </button>
      </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  title?: string
}>()

const emit = defineEmits(['toggle-theme'])

const currentDateTime = ref<string>('')
const searchQuery = ref<string>('')
const searchInput = ref<HTMLInputElement | null>(null)
const isDark = ref<boolean>(!document.body.classList.contains('light-mode'))
const router = useRouter()
let timer: ReturnType<typeof setInterval> | null = null

const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value = now.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) + ' ' + now.toLocaleTimeString('id-ID')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
      router.push({ path: '/services', query: { search: searchQuery.value.trim() } })
      searchQuery.value = ''
      searchInput.value.blur()
  }
}

const handleKeydown = (e) => {
  if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      if (searchInput.value) {
          searchInput.value.focus()
      }
  }
}

const toggleTheme = () => {
  // style.css uses body:not(.dark-mode) for light mode fallback. 
  // Let's toggle .dark-mode explicitly on body.
  document.body.classList.toggle('dark-mode')
  isDark.value = !isDark.value
  // Also notify parent if needed
  emit('toggle-theme')
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  window.addEventListener('keydown', handleKeydown)
  
  // Set initial theme based on body class
  isDark.value = document.body.classList.contains('dark-mode') || !document.body.classList.contains('light-mode')
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
})
</script>
