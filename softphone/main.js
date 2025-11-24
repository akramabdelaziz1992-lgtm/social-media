const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 400,
    minHeight: 650,
    maxWidth: 450,
    maxHeight: 750,
    frame: true,
    backgroundColor: '#1e40af',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'موبايل كول - Mobile Call',
    show: false
  });

  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();
}

function createTray() {
  // Create tray without icon for now
  // tray = new Tray(iconPath);
  // Skip tray creation if no icon available
  return;

  // Tray disabled for now
}

// IPC Handlers
ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    serverUrl: 'http://localhost:4000',
    autoConnect: true,
    notifications: true
  });
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('get-contacts', () => {
  return store.get('contacts', []);
});

ipcMain.handle('save-contacts', (event, contacts) => {
  store.set('contacts', contacts);
  return true;
});

ipcMain.handle('get-call-history', () => {
  return store.get('callHistory', []);
});

ipcMain.handle('save-call-history', (event, history) => {
  store.set('callHistory', history);
  return true;
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow.hide();
});

ipcMain.handle('show-window', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
  return true;
});

ipcMain.handle('quit-app', () => {
  isQuitting = true;
  app.quit();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
