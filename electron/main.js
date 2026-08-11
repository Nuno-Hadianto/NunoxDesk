const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const db = require('../database/db');
const dashboardController = require('../controllers/dashboardController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const serviceController = require('../controllers/serviceController');
const partController = require('../controllers/partController');
const serviceItemController = require('../controllers/serviceItemController');
const paymentController = require('../controllers/paymentController');
const settingsController = require('../controllers/settingsController');
const reportController = require('../controllers/reportController');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'NunoxDesk - NUNOX_SERVIS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'views', 'index.html'));

  // Register IPC handlers here so they are ready before the window loads
  ipcMain.handle('get-dashboard-stats', () => {
    return dashboardController.getDashboardStats();
  });

  // Customer IPC handlers
  ipcMain.handle('get-customers', (event, searchQuery) => customerController.getCustomers(searchQuery));
  ipcMain.handle('get-customer', (event, id) => customerController.getCustomerById(id));
  ipcMain.handle('add-customer', (event, data) => customerController.addCustomer(data));
  ipcMain.handle('update-customer', (event, id, data) => customerController.updateCustomer(id, data));
  ipcMain.handle('delete-customer', (event, id) => customerController.deleteCustomer(id));

  // Device IPC handlers
  ipcMain.handle('get-devices', (event, searchQuery) => deviceController.getDevices(searchQuery));
  ipcMain.handle('get-device', (event, id) => deviceController.getDeviceById(id));
  ipcMain.handle('get-devices-by-customer', (event, customerId) => deviceController.getDevicesByCustomerId(customerId));
  ipcMain.handle('add-device', (event, data) => deviceController.addDevice(data));
  ipcMain.handle('update-device', (event, id, data) => deviceController.updateDevice(id, data));
  ipcMain.handle('delete-device', (event, id) => deviceController.deleteDevice(id));

  // Service IPC handlers
  ipcMain.handle('get-services', (event, searchQuery) => serviceController.getServices(searchQuery));
  ipcMain.handle('get-service', (event, id) => serviceController.getServiceById(id));
  ipcMain.handle('get-service-history', (event, id) => serviceController.getServiceStatusHistory(id));
  ipcMain.handle('add-service', (event, data) => serviceController.addService(data));
  ipcMain.handle('update-service-status', (event, id, status, notes) => serviceController.updateServiceStatus(id, status, notes));
  ipcMain.handle('update-service-details', (event, id, data) => serviceController.updateServiceDetails(id, data));
  ipcMain.handle('delete-service', (event, id) => serviceController.deleteService(id));

  // Part IPC handlers
  ipcMain.handle('get-parts', (event, searchQuery) => partController.getParts(searchQuery));
  ipcMain.handle('get-part', (event, id) => partController.getPartById(id));
  ipcMain.handle('add-part', (event, data) => partController.addPart(data));
  ipcMain.handle('update-part', (event, id, data) => partController.updatePart(id, data));
  ipcMain.handle('update-part-stock', (event, id, change) => partController.updatePartStock(id, change));
  ipcMain.handle('delete-part', (event, id) => partController.deletePart(id));

  // Service Items (Rincian Biaya)
  ipcMain.handle('get-service-items', (event, serviceId) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event, data) => serviceItemController.addServiceItem(data));
  ipcMain.handle('delete-service-item', (event, id) => serviceItemController.deleteServiceItem(id));

  // Payments
  ipcMain.handle('get-payments', (event, serviceId) => paymentController.getPaymentsByServiceId(serviceId));
  ipcMain.handle('add-payment', (event, data) => paymentController.addPayment(data));
  ipcMain.handle('delete-payment', (event, id) => paymentController.deletePayment(id));

  // Settings
  ipcMain.handle('get-settings', () => settingsController.getSettings());
  ipcMain.handle('update-settings', (event, data) => settingsController.updateSettings(data));

  // Reports
  ipcMain.handle('get-income-report', (event, start, end) => reportController.getIncomeReport(start, end));
  ipcMain.handle('get-completed-services', (event, start, end) => reportController.getCompletedServices(start, end));

  // Backup & Restore
  ipcMain.handle('backup-database', async () => {
    const dbPath = path.join(app.getPath('userData'), 'nunoxdesk.db');
    const defaultPath = `NunoxDesk_Backup_${new Date().toISOString().split('T')[0]}.db`;
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: defaultPath,
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePath) {
      fs.copyFileSync(dbPath, filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(app.getPath('userData'), 'nunoxdesk.db');
      fs.copyFileSync(filePaths[0], dbPath);
      // App needs restart to load new db, we'll return true
      app.relaunch();
      app.exit(0);
      return true;
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menonaktifkan GPU Cache untuk mencegah error peringatan disk_cache di Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
