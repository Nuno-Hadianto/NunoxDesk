<template>
  <aside class="sidebar">
      <div class="sidebar-header">
          <h2>nuNox_servis</h2>
      </div>
      <nav class="sidebar-nav">
          <ul>
              <li :class="{ active: $route.name === 'Dashboard' }">
                <router-link to="/">
                    <span style="margin-right: 8px;">🏠</span> Dashboard
                </router-link>
              </li>
              <li class="nav-header">OPERASIONAL</li>
              <li :class="{ active: $route.name === 'Customers' }"><router-link to="/customers"><span style="margin-right: 8px;">👥</span> Pelanggan</router-link></li>
              <li :class="{ active: $route.name === 'Devices' }"><router-link to="/devices"><span style="margin-right: 8px;">📱</span> Perangkat</router-link></li>
              <li :class="{ active: $route.name === 'Services' || $route.name === 'ServiceDetail' }"><router-link to="/services"><span style="margin-right: 8px;">🛠️</span> Servis</router-link></li>
              <li :class="{ active: $route.name === 'Parts' }"><router-link to="/parts"><span style="margin-right: 8px;">📦</span> Sparepart</router-link></li>
              <!-- We will uncomment these as we create the views
              -->
              <li class="nav-header">KEUANGAN</li>
              <!--
              <li :class="{ active: $route.name === 'Payments' }"><router-link to="/payments">Pembayaran</router-link></li>
              <li :class="{ active: $route.name === 'Receipts' }"><router-link to="/receipts">Kwitansi</router-link></li>
              -->
              <li :class="{ active: $route.name === 'Reports' }"><router-link to="/reports"><span style="margin-right: 8px;">📊</span> Laporan</router-link></li>
              <li class="nav-header">SISTEM</li>
              <li v-if="currentUser?.role === 'admin'" :class="{ active: $route.name === 'Users' }">
                <router-link to="/users"><span style="margin-right: 8px;">👨‍💼</span> Karyawan</router-link>
              </li>
              <li :class="{ active: $route.name === 'Settings' }"><router-link to="/settings"><span style="margin-right: 8px;">⚙️</span> Pengaturan & Backup</router-link></li>
          </ul>
          <div style="margin-top: auto; padding: 20px;">
              <div style="margin-bottom: 10px; font-size: 0.85rem; color: #94a3b8;">
                Login sebagai: <strong style="color: white;">{{ currentUser ? currentUser.username : '-' }}</strong>
              </div>
              <button @click="$emit('logout')" class="btn btn-secondary" style="width: 100%; border: 1px solid #ef4444; color: #ef4444; background: transparent;">Logout</button>
          </div>
      </nav>
  </aside>
</template>

<script setup>
defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})

defineEmits(['logout'])

</script>
