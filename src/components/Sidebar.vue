<template>
  <aside class="sidebar">
      <div class="sidebar-header" style="justify-content: center; padding: 10px;">
          <img src="/img/logo.png" alt="nuNox_servis" style="max-height: 65px; width: 100%; object-fit: contain;" />
      </div>
      <nav class="sidebar-nav">
          <ul>
              <li :class="{ active: $route.name === 'Dashboard' }">
                <router-link to="/">
                    <LayoutDashboard class="menu-icon" /> Dashboard
                </router-link>
              </li>
              <li class="nav-header">OPERASIONAL</li>
              <li :class="{ active: $route.name === 'Customers' }"><router-link to="/customers"><Users class="menu-icon" /> Pelanggan</router-link></li>
              <li :class="{ active: $route.name === 'Devices' }"><router-link to="/devices"><Smartphone class="menu-icon" /> Perangkat</router-link></li>
              <li :class="{ active: $route.name === 'Services' || $route.name === 'ServiceDetail' }"><router-link to="/services"><Wrench class="menu-icon" /> Servis</router-link></li>
              <li :class="{ active: $route.name === 'Parts' }"><router-link to="/parts"><Package class="menu-icon" /> Sparepart</router-link></li>
              
              <li class="nav-header">KEUANGAN</li>
              <li :class="{ active: $route.name === 'Reports' }"><router-link to="/reports"><BarChart3 class="menu-icon" /> Laporan</router-link></li>
              
              <li class="nav-header">SISTEM</li>
              <li v-if="currentUser?.role === 'admin'" :class="{ active: $route.name === 'Users' }">
                <router-link to="/users"><UserCog class="menu-icon" /> Karyawan</router-link>
              </li>
              <li :class="{ active: $route.name === 'Settings' }"><router-link to="/settings"><Settings class="menu-icon" /> Pengaturan & Backup</router-link></li>
          </ul>
          <div style="margin-top: auto; padding: 20px;">
              <div style="margin-bottom: 15px; font-size: 0.85rem; color: var(--text-muted);">
                Login sebagai: <strong style="color: var(--text-primary);">{{ currentUser ? currentUser.username : '-' }}</strong>
              </div>
              <button @click="$emit('logout')" class="btn btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <LogOut :size="18" /> Logout
              </button>
          </div>
      </nav>
  </aside>
</template>

<script setup lang="ts">
import { LayoutDashboard, Users, Smartphone, Wrench, Package, BarChart3, UserCog, Settings, LogOut } from 'lucide-vue-next'
import type { User } from '../types'

defineProps<{
  currentUser?: User | null
}>()

defineEmits(['logout'])
</script>

<style scoped>
.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  stroke-width: 2.2px;
  opacity: 0.8;
  transition: all 0.3s ease;
}
.sidebar-nav li.active .menu-icon {
  opacity: 1;
  stroke: white;
}
.sidebar-nav a:hover .menu-icon {
  opacity: 1;
  stroke: var(--primary);
}
</style>
