import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Swal from 'sweetalert2'
import Chart from 'chart.js/auto'

window.Swal = Swal
window.Chart = Chart

const app = createApp(App)

app.config.globalProperties.$api = window.api

app.use(router)
app.mount('#app')
