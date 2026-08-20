"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
    appReady: () => ipcRenderer.send('app-ready'),
    getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
    // Customers
    getCustomers: (searchQuery, page, limit) => ipcRenderer.invoke('get-customers', searchQuery, page, limit),
    getCustomer: (id) => ipcRenderer.invoke('get-customer', id),
    addCustomer: (data) => ipcRenderer.invoke('add-customer', data),
    updateCustomer: (id, data) => ipcRenderer.invoke('update-customer', id, data),
    deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
    // Devices
    getDevices: (searchQuery) => ipcRenderer.invoke('get-devices', searchQuery),
    getDevice: (id) => ipcRenderer.invoke('get-device', id),
    getDevicesByCustomer: (customerId) => ipcRenderer.invoke('get-devices-by-customer', customerId),
    addDevice: (data) => ipcRenderer.invoke('add-device', data),
    updateDevice: (id, data) => ipcRenderer.invoke('update-device', id, data),
    deleteDevice: (id) => ipcRenderer.invoke('delete-device', id),
    // Services
    getServices: (searchQuery, page, limit) => ipcRenderer.invoke('get-services', searchQuery, page, limit),
    getService: (id) => ipcRenderer.invoke('get-service', id),
    getServiceHistory: (id) => ipcRenderer.invoke('get-service-history', id),
    addService: (data) => ipcRenderer.invoke('add-service', data),
    updateServiceStatus: (id, status, notes) => ipcRenderer.invoke('update-service-status', id, status, notes),
    updateServiceDetails: (id, data) => ipcRenderer.invoke('update-service-details', id, data),
    deleteService: (id) => ipcRenderer.invoke('delete-service', id),
    // Parts
    getParts: (searchQuery) => ipcRenderer.invoke('get-parts', searchQuery),
    getPart: (id) => ipcRenderer.invoke('get-part', id),
    addPart: (data) => ipcRenderer.invoke('add-part', data),
    updatePart: (id, data) => ipcRenderer.invoke('update-part', id, data),
    updatePartStock: (id, change) => ipcRenderer.invoke('update-part-stock', id, change),
    deletePart: (id) => ipcRenderer.invoke('delete-part', id),
    importPartsExcel: () => ipcRenderer.invoke('import-parts-excel'),
    // Service Items
    getServiceItems: (serviceId) => ipcRenderer.invoke('get-service-items', serviceId),
    addServiceItem: (data) => ipcRenderer.invoke('add-service-item', data),
    deleteServiceItem: (id) => ipcRenderer.invoke('delete-service-item', id),
    // Payments
    getPayments: (serviceId) => ipcRenderer.invoke('get-payments', serviceId),
    addPayment: (data) => ipcRenderer.invoke('add-payment', data),
    deletePayment: (id) => ipcRenderer.invoke('delete-payment', id),
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (data) => ipcRenderer.invoke('update-settings', data),
    // Reports
    getIncomeReport: (start, end) => ipcRenderer.invoke('get-income-report', start, end),
    getCompletedServices: (start, end) => ipcRenderer.invoke('get-completed-services', start, end),
    getTopSpareparts: (start, end) => ipcRenderer.invoke('get-top-spareparts', start, end),
    // Backup & Restore
    backupDatabase: () => ipcRenderer.invoke('backup-database'),
    restoreDatabase: () => ipcRenderer.invoke('restore-database'),
    // Export
    exportExcel: (data) => ipcRenderer.invoke('export-excel', data),
    exportPdf: (data) => ipcRenderer.invoke('export-pdf', data),
    openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
    getLogoBase64: () => ipcRenderer.invoke('get-logo-base64'),
    // Print Preview
    printPreview: (options) => ipcRenderer.invoke('print-preview', options),
    // Users & Auth
    login: (username, password) => ipcRenderer.invoke('login', username, password),
    getUsers: () => ipcRenderer.invoke('get-users'),
    getUser: (id) => ipcRenderer.invoke('get-user', id),
    addUser: (data) => ipcRenderer.invoke('add-user', data),
    updateUser: (id, data) => ipcRenderer.invoke('update-user', id, data),
    deleteUser: (id) => ipcRenderer.invoke('delete-user', id)
});
