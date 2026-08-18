import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Memasang properti global jika diperlukan, misal untuk window.api (meskipun bisa diakses langsung via window.api di komponen Vue)
const app = createApp(App)

app.config.globalProperties.$api = window.api

app.use(router)
app.mount('#app')
