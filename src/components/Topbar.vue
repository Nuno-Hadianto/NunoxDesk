<template>
  <header class="topbar">
      <div class="topbar-title" style="display: flex; align-items: center; gap: 20px;">
          <h1>{{ title }}</h1>
      </div>
      <div class="topbar-actions" style="display: flex; align-items: center; gap: 15px;">
          <div class="badge" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); font-weight: 500; font-size: 0.9rem; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
              <Clock :size="16" /> {{ currentDateTime }}
          </div>
          <button @click="toggleTheme" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-primary); transition: var(--transition);">
              <Sun v-if="isDark" :size="20" />
              <Moon v-else :size="20" />
          </button>
      </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, Sun, Moon } from 'lucide-vue-next'

defineProps<{
  title?: string
}>()

const emit = defineEmits(['toggle-theme'])

const currentDateTime = ref<string>('')
const isDark = ref<boolean>(!document.body.classList.contains('light-mode'))
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
  
  // Set initial theme based on body class
  isDark.value = document.body.classList.contains('dark-mode') || !document.body.classList.contains('light-mode')
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
