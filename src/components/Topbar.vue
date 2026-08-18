<template>
  <header class="topbar">
      <div class="topbar-title">
          <h1>{{ title }}</h1>
      </div>
      <div class="topbar-actions">
          <button @click="$emit('toggle-theme')" class="btn btn-secondary btn-sm" style="margin-right: 15px; border-radius: 20px;">🌙 Dark Mode</button>
          <span>{{ currentDateTime }}</span>
      </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['toggle-theme'])

const currentDateTime = ref('')
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

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
