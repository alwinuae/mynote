const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const url = require('url');

// Register custom protocol BEFORE app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Alwin Note',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('app://./index.html');
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  // Map app:// requests to files in the 'out' directory
  protocol.handle('app', (request) => {
    let urlPath = new URL(request.url).pathname;

    if (urlPath === '/') {
      urlPath = '/index.html';
    }

    const filePath = path.join(__dirname, 'out', decodeURIComponent(urlPath));
    return net.fetch(url.pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
