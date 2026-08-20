const { contextBridge, ipcRenderer } = require('electron');

const invokeSafe = async (channel: any, ...args: any[]) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error: any) {
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
  getCustomers: (searchQuery: any, page: any, limit: any) => invokeSafe('get-customers', searchQuery, page, limit),
  getCustomer: (id: any) => invokeSafe('get-customer', id),
  addCustomer: (data: any) => invokeSafe('add-customer', data),
  updateCustomer: (id: any, data: any) => invokeSafe('update-customer', id, data),
  deleteCustomer: (id: any) => invokeSafe('delete-customer', id),

  // Devices
  getDevices: (searchQuery: any) => invokeSafe('get-devices', searchQuery),
  getDevice: (id: any) => invokeSafe('get-device', id),
  getDevicesByCustomer: (customerId: any) => invokeSafe('get-devices-by-customer', customerId),
  addDevice: (data: any) => invokeSafe('add-device', data),
  updateDevice: (id: any, data: any) => invokeSafe('update-device', id, data),
  deleteDevice: (id: any) => invokeSafe('delete-device', id),

  // Services
  getServices: (searchQuery: any, page: any, limit: any) => invokeSafe('get-services', searchQuery, page, limit),
  getService: (id: any) => invokeSafe('get-service', id),
  getServiceHistory: (id: any) => invokeSafe('get-service-history', id),
  addService: (data: any) => invokeSafe('add-service', data),
  updateServiceStatus: (id: any, status: any, notes: any, warrantyDays: any = 0) => invokeSafe('update-service-status', id, status, notes, warrantyDays),
  updateServiceDetails: (id: any, data: any) => invokeSafe('update-service-details', id, data),
  deleteService: (id: any) => invokeSafe('delete-service', id),

  // Warranty
  checkWarranty: (deviceId: any) => invokeSafe('check-warranty', deviceId),

  // Photos
  uploadPhoto: (serviceId: any, type: any, buffer: any, fileName: any) => invokeSafe('upload-photo', serviceId, type, buffer, fileName),
  getPhotos: (serviceId: any) => invokeSafe('get-photos', serviceId),
  deletePhoto: (id: any) => invokeSafe('delete-photo', id),

  // Parts
  getParts: (searchQuery: any) => invokeSafe('get-parts', searchQuery),
  getPart: (id: any) => invokeSafe('get-part', id),
  addPart: (data: any) => invokeSafe('add-part', data),
  updatePart: (id: any, data: any) => invokeSafe('update-part', id, data),
  updatePartStock: (id: any, change: any) => invokeSafe('update-part-stock', id, change),
  deletePart: (id: any) => invokeSafe('delete-part', id),
  importPartsExcel: () => invokeSafe('import-parts-excel'),
  getLowStockParts: (threshold: any) => invokeSafe('get-low-stock-parts', threshold),

  // Service Items
  getServiceItems: (serviceId: any) => invokeSafe('get-service-items', serviceId),
  addServiceItem: (data: any) => invokeSafe('add-service-item', data),
  deleteServiceItem: (id: any) => invokeSafe('delete-service-item', id),

  // Payments
  getPayments: (serviceId: any) => invokeSafe('get-payments', serviceId),
  addPayment: (data: any) => invokeSafe('add-payment', data),
  deletePayment: (id: any) => invokeSafe('delete-payment', id),

  // Settings
  getSettings: () => invokeSafe('get-settings'),
  updateSettings: (data: any) => invokeSafe('update-settings', data),

  // Reports
  getIncomeReport: (start: any, end: any) => invokeSafe('get-income-report', start, end),
  getCompletedServices: (start: any, end: any) => invokeSafe('get-completed-services', start, end),
  getTopSpareparts: (start: any, end: any) => invokeSafe('get-top-spareparts', start, end),

  // Backup & Restore
  backupDatabase: () => invokeSafe('backup-database'),
  restoreDatabase: () => invokeSafe('restore-database'),
  selectDirectory: () => invokeSafe('select-directory'),

  // Export
  exportExcel: (data: any) => invokeSafe('export-excel', data),
  exportPdf: (data: any) => invokeSafe('export-pdf', data),
  openExternalUrl: (url: any) => invokeSafe('open-external-url', url),
  getLogoBase64: () => invokeSafe('get-logo-base64'),
  
  // Print Preview
  printPreview: (options: any) => invokeSafe('print-preview', options),

  // Users & Auth
  login: (username: any, password: any) => invokeSafe('login', username, password),
  getUsers: () => invokeSafe('get-users'),
  getUser: (id: any) => invokeSafe('get-user', id),
  addUser: (data: any) => invokeSafe('add-user', data),
  updateUser: (id: any, data: any) => invokeSafe('update-user', id, data),
  deleteUser: (id: any) => invokeSafe('delete-user', id)
});
