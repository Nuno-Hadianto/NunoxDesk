import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Customer from '../views/Customer.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customer,
    meta: { title: 'Daftar Pelanggan' }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('../views/Device.vue'),
    meta: { title: 'Daftar Perangkat' }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/Service.vue'),
    meta: { title: 'Daftar Servis' }
  },
  {
    path: '/services/:id',
    name: 'ServiceDetail',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { title: 'Detail Servis' }
  },
  {
    path: '/parts',
    name: 'Parts',
    component: () => import('../views/Part.vue'),
    meta: { title: 'Daftar Sparepart' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Report.vue'),
    meta: { title: 'Laporan Keuangan' }
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('../views/Pos.vue'),
    meta: { title: 'Kasir (POS)' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/User.vue'),
    meta: { title: 'Manajemen Karyawan' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: 'Pengaturan & Backup' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
