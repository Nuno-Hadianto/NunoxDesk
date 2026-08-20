"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
const invokeSafe = async (channel, ...args) => {
    try {
        return await ipcRenderer.invoke(channel, ...args);
    }
    catch (error) {
        if (error && error.message) {
            error.message = error.message.replace(/Error invoking remote method '.*?':\s*(Error:\s*)?/, '');
        }
        throw error;
    }
};
contextBridge.exposeInMainWorld('api', {
    appReady: () => ipcRenderer.send('app-ready'),
    getDashboardStats: () => invokeSafe('get-dashboard-stats'),
    // Customers
    getCustomers: (searchQuery, page, limit) => invokeSafe('get-customers', searchQuery, page, limit),
    getCustomer: (id) => invokeSafe('get-customer', id),
    addCustomer: (data) => invokeSafe('add-customer', data),
    updateCustomer: (id, data) => invokeSafe('update-customer', id, data),
    deleteCustomer: (id) => invokeSafe('delete-customer', id),
    // Devices
    getDevices: (searchQuery) => invokeSafe('get-devices', searchQuery),
    getDevice: (id) => invokeSafe('get-device', id),
    getDevicesByCustomer: (customerId) => invokeSafe('get-devices-by-customer', customerId),
    addDevice: (data) => invokeSafe('add-device', data),
    updateDevice: (id, data) => invokeSafe('update-device', id, data),
    deleteDevice: (id) => invokeSafe('delete-device', id),
    // Services
    getServices: (searchQuery, page, limit) => invokeSafe('get-services', searchQuery, page, limit),
    getService: (id) => invokeSafe('get-service', id),
    getServiceHistory: (id) => invokeSafe('get-service-history', id),
    addService: (data) => invokeSafe('add-service', data),
    updateServiceStatus: (id, status, notes) => invokeSafe('update-service-status', id, status, notes),
    updateServiceDetails: (id, data) => invokeSafe('update-service-details', id, data),
    deleteService: (id) => invokeSafe('delete-service', id),
    // Parts
    getParts: (searchQuery) => invokeSafe('get-parts', searchQuery),
    getPart: (id) => invokeSafe('get-part', id),
    addPart: (data) => invokeSafe('add-part', data),
    updatePart: (id, data) => invokeSafe('update-part', id, data),
    updatePartStock: (id, change) => invokeSafe('update-part-stock', id, change),
    deletePart: (id) => invokeSafe('delete-part', id),
    importPartsExcel: () => invokeSafe('import-parts-excel'),
    // Service Items
    getServiceItems: (serviceId) => invokeSafe('get-service-items', serviceId),
    addServiceItem: (data) => invokeSafe('add-service-item', data),
    deleteServiceItem: (id) => invokeSafe('delete-service-item', id),
    // Payments
    getPayments: (serviceId) => invokeSafe('get-payments', serviceId),
    addPayment: (data) => invokeSafe('add-payment', data),
    deletePayment: (id) => invokeSafe('delete-payment', id),
    // Settings
    getSettings: () => invokeSafe('get-settings'),
    updateSettings: (data) => invokeSafe('update-settings', data),
    // Reports
    getIncomeReport: (start, end) => invokeSafe('get-income-report', start, end),
    getCompletedServices: (start, end) => invokeSafe('get-completed-services', start, end),
    getTopSpareparts: (start, end) => invokeSafe('get-top-spareparts', start, end),
    // Backup & Restore
    backupDatabase: () => invokeSafe('backup-database'),
    restoreDatabase: () => invokeSafe('restore-database'),
    // Export
    exportExcel: (data) => invokeSafe('export-excel', data),
    exportPdf: (data) => invokeSafe('export-pdf', data),
    openExternalUrl: (url) => invokeSafe('open-external-url', url),
    getLogoBase64: () => invokeSafe('get-logo-base64'),
    // Print Preview
    printPreview: (options) => invokeSafe('print-preview', options),
    // Users & Auth
    login: (username, password) => invokeSafe('login', username, password),
    getUsers: () => invokeSafe('get-users'),
    getUser: (id) => invokeSafe('get-user', id),
    addUser: (data) => invokeSafe('add-user', data),
    updateUser: (id, data) => invokeSafe('update-user', id, data),
    deleteUser: (id) => invokeSafe('delete-user', id)
});
