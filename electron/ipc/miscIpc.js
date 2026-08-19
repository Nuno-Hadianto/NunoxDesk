const { app, ipcMain, dialog, shell, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const xlsx = require('xlsx');

const db = require('../../database/db');
const dashboardController = require('../../controllers/dashboardController');
const paymentController = require('../../controllers/paymentController');
const settingsController = require('../../controllers/settingsController');
const reportController = require('../../controllers/reportController');

function registerMiscIpc(mainWindow) {
  // Dashboard
  ipcMain.handle('get-dashboard-stats', () => dashboardController.getDashboardStats());

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
  ipcMain.handle('get-top-spareparts', (event, start, end) => reportController.getTopSpareparts(start, end));

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

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
      db.close();
      fs.copyFileSync(filePaths[0], dbPath);
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 2500);
      return true;
    }
    return false;
  });

  // Export & Print
  ipcMain.handle('export-excel', async (event, data) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan Laporan Excel',
        defaultPath: 'Laporan_nuNox_servis.xlsx',
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      const worksheet = xlsx.utils.json_to_sheet(data);
      const colWidths = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
      worksheet['!cols'] = colWidths;

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Laporan');

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

      const pdfWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfData = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
      fs.writeFileSync(filePath, pdfData);
      pdfWindow.close();
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating PDF:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('print-preview', async (event, options = {}) => {
    try {
      const pdfPath = path.join(os.tmpdir(), `nunox_print_${Date.now()}.pdf`);
      const pdfOptions = {
        printBackground: true,
        landscape: options.landscape || false,
        marginsType: 1
      };
      if (options.pageSize) {
        pdfOptions.pageSize = options.pageSize;
      }
      const pdfData = await mainWindow.webContents.printToPDF(pdfOptions);
      fs.writeFileSync(pdfPath, pdfData);
      await shell.openPath(pdfPath);
      return true;
    } catch (error) {
      console.error('Error generating print preview:', error);
      throw error;
    }
  });

  ipcMain.handle('open-external-url', async (event, url) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error('Failed to open external url:', error);
      return false;
    }
  });

  ipcMain.handle('get-logo-base64', async () => {
    try {
      const logoPath = path.join(__dirname, '..', '..', 'public', 'img', 'logo.png');
      if (fs.existsSync(logoPath)) {
        const ext = path.extname(logoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');
        const bitmap = fs.readFileSync(logoPath);
        return `data:${mimeType};base64,${bitmap.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to read logo:', error);
      return null;
    }
  });
}

module.exports = { registerMiscIpc };
