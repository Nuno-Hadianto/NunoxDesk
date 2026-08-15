const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const xlsx = require('xlsx');
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
const userController = require('../controllers/userController');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'nuNox_servis - NUNOX_SERVIS',
    autoHideMenuBar: true, // Sembunyikan menu bar bawaan agar lebih bersih
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.maximize(); // Otomatis layar penuh (maximized) saat dibuka

  mainWindow.loadFile(path.join(__dirname, '..', 'views', 'index.html'));

  // Register IPC handlers here so they are ready before the window loads
  ipcMain.handle('get-dashboard-stats', () => {
    return dashboardController.getDashboardStats();
  });

  // Customer IPC handlers
  ipcMain.handle('get-customers', (event, searchQuery, page, limit) => customerController.getCustomers(searchQuery, page, limit));
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
  ipcMain.handle('get-services', (event, searchQuery, page, limit) => serviceController.getServices(searchQuery, page, limit));
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

  ipcMain.handle('import-parts-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Pilih File Excel Sparepart',
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { success: false, canceled: true };

      const filePath = filePaths[0];
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (data.length === 0) {
        return { success: false, error: 'File Excel kosong atau format tidak sesuai.' };
      }

      const result = partController.importParts(data);
      return { success: true, result };
    } catch (error) {
      console.error('Error importing excel:', error);
      return { success: false, error: error.message };
    }
  });

  // Service Items (Rincian Biaya)
  ipcMain.handle('get-service-items', (event, serviceId) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event, data) => serviceItemController.addServiceItem(data));
  ipcMain.handle('delete-service-item', (event, id) => serviceItemController.deleteServiceItem(id));

  // Payments
  ipcMain.handle('get-payments', (event, serviceId) => paymentController.getPaymentsByServiceId(serviceId));
  ipcMain.handle('add-payment', (event, data) => paymentController.addPayment(data));
  ipcMain.handle('delete-payment', (event, id) => paymentController.deletePayment(id));

  // Users
  ipcMain.handle('login', (event, username, password) => {
    try { return { success: true, user: userController.login(username, password) }; }
    catch (err) { return { success: false, error: err.message }; }
  });
  ipcMain.handle('get-users', () => userController.getUsers());
  ipcMain.handle('get-user', (event, id) => userController.getUserById(id));
  ipcMain.handle('add-user', (event, data) => {
    try { return { success: true, id: userController.addUser(data) }; }
    catch (err) { return { success: false, error: err.message }; }
  });
  ipcMain.handle('update-user', (event, id, data) => {
    try { return { success: true, result: userController.updateUser(id, data) }; }
    catch (err) { return { success: false, error: err.message }; }
  });
  ipcMain.handle('delete-user', (event, id) => {
    try { return { success: true, result: userController.deleteUser(id) }; }
    catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('export-excel', async (event, data) => {
    try {
      // Prompt user to select save location
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan Laporan Excel',
        defaultPath: 'Laporan_nuNox_servis.xlsx',
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      // Convert JSON data to worksheet
      const worksheet = xlsx.utils.json_to_sheet(data);
      
      // Auto-size columns slightly
      const colWidths = [
        { wch: 15 }, // No Tiket
        { wch: 15 }, // Tanggal
        { wch: 20 }, // Pelanggan
        { wch: 20 }, // Perangkat
        { wch: 15 }  // Total Biaya
      ];
      worksheet['!cols'] = colWidths;

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Laporan');

      // Write to file
      xlsx.writeFile(workbook, filePath);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error exporting excel:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export-pdf', async (event, { html, filename }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan PDF',
        defaultPath: filename || 'Invoice.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      // Buat window tersembunyi untuk merender HTML ke PDF
      const pdfWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
      
      // Load HTML (menggunakan data URI)
      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      
      // Beri sedikit waktu jika ada font/gambar eksternal yang perlu diload
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfData = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4'
      });
      
      fs.writeFileSync(filePath, pdfData);
      pdfWindow.close();
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating PDF:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings
  ipcMain.handle('get-settings', () => settingsController.getSettings());
  ipcMain.handle('update-settings', (event, data) => settingsController.updateSettings(data));

  // Reports
  ipcMain.handle('get-income-report', (event, start, end) => reportController.getIncomeReport(start, end));
  ipcMain.handle('get-completed-services', (event, start, end) => reportController.getCompletedServices(start, end));

  // Backup & Restore
  ipcMain.handle('backup-database', async () => {
    const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
    const defaultPath = `nuNox_servis_Backup_${new Date().toISOString().split('T')[0]}.db`;
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: defaultPath,
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePath) {
      await db.backup(filePath);
      return true;
    }
    return false;
  });

  // Print Preview
  ipcMain.handle('print-preview', async (event, options = {}) => {
    try {
      const pdfPath = path.join(os.tmpdir(), `nunox_print_${Date.now()}.pdf`);
      
      const pdfData = await mainWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: options.pageSize || 'A4',
        landscape: options.landscape || false,
        marginsType: 1 // Default margins
      });
      
      fs.writeFileSync(pdfPath, pdfData);
      
      // Open in system default PDF viewer (provides the best print preview and printing options)
      await shell.openPath(pdfPath);
      return true;
    } catch (error) {
      console.error('Error generating print preview:', error);
      throw error;
    }
  });

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
      db.close(); // Close database before overwriting to release file lock
      fs.copyFileSync(filePaths[0], dbPath);
      // App needs restart to load new db. Delay to allow frontend notification.
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 2500);
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

app.on('window-all-closed', async () => {
  // Auto Backup before quitting
  try {
    const fs = require('fs');
    const path = require('path');
    
    const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
    const backupDir = path.join(app.getPath('documents'), 'nuNox_servis_Backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const backupPath = path.join(backupDir, `AutoBackup_${today}.db`);
    
    if (fs.existsSync(dbPath)) {
      await db.backup(backupPath);
      console.log('Auto backup saved to:', backupPath);
    }
  } catch (error) {
    console.error('Failed to perform auto backup:', error);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
