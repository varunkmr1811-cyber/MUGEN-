const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe bridge to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  getVersion: () => process.versions.electron,
  // Add more IPC methods here if needed
  send: (channel, data) => {
    const validChannels = ['export-data', 'import-data'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, func) => {
    const validChannels = ['import-data-result'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
