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
                  style="padding-left: 35px; border-radius: 20px; border: 1px solid var(--border-color); width: 250px; transition: width 0.3s;"
              >
          </div>
      </div>
      <div class="topbar-actions" style="display: flex; align-items: center; gap: 15px;">
          <button @click="$emit('toggle-theme')" class="btn btn-secondary btn-sm" style="border-radius: 20px; padding: 6px 16px;">🌙 Mode Gelap</button>
          <div style="background: var(--card-bg); padding: 6px 16px; border-radius: 20px; font-weight: 500; font-size: 0.9rem; border: 1px solid var(--border-color); color: var(--text-color);">
              🕒 {{ currentDateTime }}
          </div>
      </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['toggle-theme'])

const currentDateTime = ref('')
const searchQuery = ref('')
const searchInput = ref(null)
const router = useRouter()
let timer = null

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

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
})
</script>
