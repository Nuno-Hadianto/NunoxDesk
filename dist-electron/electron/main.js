"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const db = require('../database/db');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
// Setup logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
// Import IPC modules
const { registerCustomerIpc } = require('./ipc/customerIpc');
const { registerDeviceIpc } = require('./ipc/deviceIpc');
const { registerServiceIpc } = require('./ipc/serviceIpc');
const { registerPartIpc } = require('./ipc/partIpc');
const { registerUserIpc } = require('./ipc/userIpc');
const { registerMiscIpc } = require('./ipc/miscIpc');
const registerSaleIpc = require('./ipc/saleIpc');
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'nuNox_servis - NUNOX_SERVIS',
        icon: path.join(__dirname, '..', 'public', 'img', 'logo.png'),
        autoHideMenuBar: true,
        show: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    ipcMain.once('app-ready', () => {
        mainWindow.maximize();
        mainWindow.show();
    });
    const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
    if (isDev) {
        // Memuat Vite Dev Server
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools(); // Optional: buka devtools otomatis
    }
    else {
        // Memuat file hasil build Vite
        mainWindow.loadFile(path.join(__dirname, '..', 'dist_frontend', 'index.html'));
    }
    // Register IPC handlers
    registerCustomerIpc();
    registerDeviceIpc();
    registerServiceIpc();
    registerPartIpc(mainWindow);
    registerUserIpc();
    registerMiscIpc(mainWindow);
    registerSaleIpc(mainWindow);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Menonaktifkan GPU Cache
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');
app.whenReady().then(() => {
    // Auto-Migration
    try {
        db.prepare('ALTER TABLE service_orders ADD COLUMN warranty_end_date DATETIME').run();
        log.info('Added warranty_end_date column to service_orders.');
    }
    catch (e) {
        // Column might already exist, ignore.
    }
    // Create photos directory
    const fs = require('fs');
    const photosDir = path.join(app.getPath('userData'), 'photos');
    if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir, { recursive: true });
    }
    createWindow();
    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
autoUpdater.on('update-available', () => {
    log.info('Update available.');
});
autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded. Prompting user to install.');
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Sebuah pembaruan telah diunduh. Aplikasi akan direstart untuk memasang pembaruan.',
        buttons: ['Restart Sekarang', 'Nanti']
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});
autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err);
});
app.on('window-all-closed', async () => {
    // Auto Backup before quitting
    try {
        const fs = require('fs');
        const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
        const settingsRepo = require('../repositories/settingsRepository');
        const settings = settingsRepo.getSettings();
        let backupDir = settings.auto_backup_path;
        // Fallback to default if no auto_backup_path is set
        if (!backupDir) {
            backupDir = path.join(app.getPath('documents'), 'nuNox_servis_Backups');
        }
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const today = new Date().toISOString().split('T')[0];
        const backupPath = path.join(backupDir, `AutoBackup_NuNox_${today}.db`);
        if (fs.existsSync(dbPath)) {
            await db.backup(backupPath);
            console.log('Auto backup saved to:', backupPath);
            // Also backup photos if the directory exists
            const photosDir = path.join(app.getPath('userData'), 'photos');
            if (fs.existsSync(photosDir)) {
                // simple copy for photos isn't exactly easy for directories without extra modules,
                // but we can copy the whole folder or just let the user know photos aren't backed up in the DB.
                // For now, let's keep it simple and just backup the DB. The DB is the most critical.
            }
        }
    }
    catch (error) {
        console.error('Failed to perform auto backup:', error);
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
