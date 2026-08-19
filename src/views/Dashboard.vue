<template>
  <div class="fade-in" style="padding-bottom: 20px;">
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border-top: 4px solid var(--primary); transition: var(--transition-smooth); display: flex; flex-direction: column; align-items: flex-start;">
              <span style="font-size: 2rem; margin-bottom: 10px;">🛠️</span>
              <h3 style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Servis Hari Ini</h3>
              <p class="stat-value" style="font-size: 1.8rem; font-weight: 800; color: var(--text-main);">{{ stats.todayServices }}</p>
          </div>
          <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border-top: 4px solid var(--warning); transition: var(--transition-smooth); display: flex; flex-direction: column; align-items: flex-start;">
              <span style="font-size: 2rem; margin-bottom: 10px;">⏳</span>
              <h3 style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Sedang Dikerjakan</h3>
              <p class="stat-value" style="font-size: 1.8rem; font-weight: 800; color: var(--text-main);">{{ stats.inProgress }}</p>
          </div>
          <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border-top: 4px solid var(--success); transition: var(--transition-smooth); display: flex; flex-direction: column; align-items: flex-start;">
              <span style="font-size: 2rem; margin-bottom: 10px;">✅</span>
              <h3 style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Selesai</h3>
              <p class="stat-value" style="font-size: 1.8rem; font-weight: 800; color: var(--text-main);">{{ stats.completed }}</p>
          </div>
          <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border-top: 4px solid var(--primary); transition: var(--transition-smooth); display: flex; flex-direction: column; align-items: flex-start;">
              <span style="font-size: 2rem; margin-bottom: 10px;">💰</span>
              <h3 style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Pendapatan Bulan Ini</h3>
              <p class="stat-value" style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">{{ formatCurrency(stats.incomeMonth) }}</p>
          </div>
          <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border-top: 4px solid var(--success); transition: var(--transition-smooth); display: flex; flex-direction: column; align-items: flex-start;">
              <span style="font-size: 2rem; margin-bottom: 10px;">📈</span>
              <h3 style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Laba Bersih Bulan Ini</h3>
              <p class="stat-value" :class="stats.labaBersih >= 0 ? 'text-success' : 'text-danger'" style="font-size: 1.5rem; font-weight: 800;">
                {{ formatCurrency(stats.labaBersih) }}
              </p>
          </div>
      </div>

  <div class="dashboard-grid">
      <div class="card chart-container">
          <h2>Tren Pendapatan (6 Bulan)</h2>
          <div style="position: relative; height: 300px; width: 100%;">
              <canvas id="income-chart"></canvas>
          </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 25px;">
          <!-- Peringatan Barang Terlantar -->
          <div class="card warning-card">
              <h2 style="margin-bottom: 15px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                  <span style="background: linear-gradient(135deg, #ef4444, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">🚨 Peringatan Follow-up Pelanggan</span>
              </h2>
              <div class="table-container" style="max-height: 250px;">
                  <table class="data-table">
                      <thead>
                          <tr>
                              <th>No. Tiket</th>
                              <th>Status</th>
                              <th>Lama (Hari)</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-if="!stats.abandonedServices || stats.abandonedServices.length === 0">
                              <td colspan="3" class="text-center" style="padding: 20px; color: #64748b;">Tidak ada barang tertunda/terlantar.</td>
                          </tr>
                          <tr v-for="srv in stats.abandonedServices" :key="srv.id" @click="$router.push('/services/' + srv.id)" style="cursor: pointer;" title="Klik untuk Buka Detail">
                              <td style="color: var(--primary-color); font-weight: bold;">{{ srv.ticket_number }}</td>
                              <td><span style="font-size: 0.8rem; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">{{ srv.service_status }}</span></td>
                              <td>
                                  <span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.2);">
                                      {{ srv.days_pending }} Hari
                                  </span>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          <!-- Peringatan Stok -->
          <div class="card warning-card">
              <h2 style="margin-bottom: 15px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                  <span style="background: linear-gradient(135deg, #ef4444, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">⚠️ Peringatan Stok Sparepart Menipis</span>
              </h2>
              <div class="table-container" style="max-height: 250px;">
                  <table class="data-table">
                      <thead>
                          <tr>
                              <th>Kode</th>
                              <th>Nama</th>
                              <th>Stok</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-if="stats.lowStockParts.length === 0">
                              <td colspan="3" class="text-center" style="padding: 20px; color: #64748b;">Semua stok sparepart aman.</td>
                          </tr>
                          <tr v-for="part in stats.lowStockParts" :key="part.id">
                              <td>{{ part.part_code || '-' }}</td>
                              <td><strong>{{ part.name }}</strong></td>
                              <td>
                                  <span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.2);">
                                      {{ part.stock }}
                                  </span>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DashboardStats } from '../types'

const stats = ref<DashboardStats>({
  todayServices: 0,
  inProgress: 0,
  completed: 0,
  incomeMonth: 0,
  labaBersih: 0,
  chartData: { labels: [], values: [] },
  lowStockParts: [],
  abandonedServices: []
})

let chartInstance: any = null

const formatCurrency = (amount: number | string | undefined | null) => {
  return 'Rp ' + parseInt(String(amount || 0)).toLocaleString('id-ID')
}

const loadDashboard = async () => {
  if (window.api && window.api.getDashboardStats) {
      try {
          const data = await window.api.getDashboardStats()
          stats.value = data
          renderChart(data.chartData)
      } catch (error) {
          console.error("Failed to load dashboard stats:", error)
      }
  }
}

const renderChart = (chartData: { labels: string[], values: number[] }) => {
  if (chartInstance) {
      chartInstance.destroy()
  }
  
  const ctx = document.getElementById('income-chart') as HTMLCanvasElement
  if (!ctx) return
  
  chartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
          labels: chartData.labels,
          datasets: [{
              label: 'Pendapatan',
              data: chartData.values,
              backgroundColor: '#4f46e5',
              borderRadius: 4
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: { display: false }
          },
          scales: {
              y: { 
                  beginAtZero: true,
                  ticks: {
                      callback: function(value) {
                          return 'Rp ' + value.toLocaleString('id-ID')
                      }
                  }
              }
          }
      }
  })
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
.text-center { text-align: center; }
</style>
