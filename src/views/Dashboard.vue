<template>
  <div class="fade-in" style="padding-bottom: 20px;">
      <div class="stats-grid">
          <StatCard title="Servis Hari Ini" :value="stats.todayServices" variant="primary" clickable @click="$router.push('/services')">
              <template #icon><Wrench :size="28" :stroke-width="2" /></template>
          </StatCard>
          
          <StatCard title="Sedang Dikerjakan" :value="stats.inProgress" variant="warning" clickable @click="$router.push('/services?search=Proses')">
              <template #icon><Hourglass :size="28" :stroke-width="2" /></template>
          </StatCard>
          
          <StatCard title="Selesai" :value="stats.completed" variant="success" clickable @click="$router.push('/services?search=Selesai')">
              <template #icon><CheckCircle :size="28" :stroke-width="2" /></template>
          </StatCard>
          
          <StatCard title="Pendapatan Bulan Ini" :value="formatCurrency(stats.incomeMonth)" variant="info">
              <template #icon><Wallet :size="28" :stroke-width="2" /></template>
          </StatCard>
          
          <StatCard title="Laba Bersih Bulan Ini" 
                    :value="formatCurrency(stats.labaBersih)" 
                    variant="success" 
                    :valueClass="stats.labaBersih >= 0 ? 'text-success' : 'text-danger'">
              <template #icon><TrendingUp :size="28" :stroke-width="2" /></template>
          </StatCard>
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
              <h2 style="margin-bottom: 15px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; color: var(--danger);">
                  <AlertOctagon :size="24" /> Peringatan Follow-up Pelanggan
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
                              <td style="color: var(--primary); font-weight: bold;">{{ srv.ticket_number }}</td>
                              <td><span class="badge badge-warning">{{ srv.service_status }}</span></td>
                              <td>
                                  <span class="badge badge-danger">
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
              <h2 style="margin-bottom: 15px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; color: var(--warning);">
                  <AlertTriangle :size="24" /> Peringatan Stok Sparepart Menipis
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
                                  <span class="badge badge-danger">
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
import { useRouter } from 'vue-router'
import { Wrench, Hourglass, CheckCircle, Wallet, TrendingUp, AlertOctagon, AlertTriangle } from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import StatCard from '../components/StatCard.vue'
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
                      callback: function(value: number | string) {
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
