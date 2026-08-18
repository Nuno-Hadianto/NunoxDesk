const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const db = require('../database/db');

// Import IPC modules
const { registerCustomerIpc } = require('./ipc/customerIpc');
const { registerDeviceIpc } = require('./ipc/deviceIpc');
const { registerServiceIpc } = require('./ipc/serviceIpc');
const { registerPartIpc } = require('./ipc/partIpc');
const { registerUserIpc } = require('./ipc/userIpc');
const { registerMiscIpc } = require('./ipc/miscIpc');

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.maximize();
  
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    // Memuat Vite Dev Server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Optional: buka devtools otomatis
  } else {
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menonaktifkan GPU Cache
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
