const { app, BrowserWindow, Menu, shell, nativeTheme } = require('electron');
const path = require('path');

// Force dark mode
nativeTheme.themeSource = 'dark';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MUGEN (無限) — Habit Tracker',
    icon: path.join(__dirname, '..', 'build-resources', 'icon.ico'),
    backgroundColor: '#070a12',
    titleBarStyle: 'default',
    autoHideMenuBar: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  });

  // Load built web app
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  // Show window after content loads (prevents flash of white)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Custom menu bar
function createMenu() {
  const template = [
    {
      label: 'MUGEN',
      submenu: [
        {
          label: 'About MUGEN',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About MUGEN (無限)',
              message: 'MUGEN (無限) — Infinite Discipline',
              detail: 'Gamified Monthly Habit Tracker & Analytics\n\nVersion 1.0.0\n\nTrack habits, build streaks, earn XP, and level up your life.\n\n© 2026 MUGEN',
            });
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quit MUGEN' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createMenu();
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
