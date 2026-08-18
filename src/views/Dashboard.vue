<template>
  <div class="dashboard-stats">
      <div class="stat-card">
          <h3>Servis Hari Ini</h3>
          <p class="stat-value">{{ stats.todayServices }}</p>
      </div>
      <div class="stat-card">
          <h3>Sedang Dikerjakan</h3>
          <p class="stat-value">{{ stats.inProgress }}</p>
      </div>
      <div class="stat-card">
          <h3>Selesai</h3>
          <p class="stat-value">{{ stats.completed }}</p>
      </div>
      <div class="stat-card">
          <h3>Pendapatan Bulan Ini</h3>
          <p class="stat-value">{{ formatCurrency(stats.incomeMonth) }}</p>
      </div>
      <div class="stat-card">
          <h3>Laba Bersih Bulan Ini</h3>
          <p class="stat-value" :class="stats.labaBersih >= 0 ? 'text-success' : 'text-danger'">
            {{ formatCurrency(stats.labaBersih) }}
          </p>
      </div>
  </div>

  <div class="dashboard-grid">
      <div class="card chart-container">
          <h2>Tren Pendapatan (6 Bulan)</h2>
          <canvas id="income-chart"></canvas>
      </div>

      <div class="card warning-card">
          <h2>Peringatan Stok Sparepart</h2>
          <div class="table-container" style="max-height: 250px;">
              <table class="table">
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
                          <td>{{ part.name }}</td>
                          <td><span class="badge" style="background-color: #ef4444;">{{ part.stock }} {{ part.unit }}</span></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  todayServices: 0,
  inProgress: 0,
  completed: 0,
  incomeMonth: 0,
  labaBersih: 0,
  chartData: { labels: [], values: [] },
  lowStockParts: []
})

let chartInstance = null

const formatCurrency = (amount) => {
  return 'Rp ' + parseInt(amount || 0).toLocaleString('id-ID')
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

const renderChart = (chartData) => {
  if (chartInstance) {
      chartInstance.destroy()
  }
  
  const ctx = document.getElementById('income-chart')
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
