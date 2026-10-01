// Manual multi-monitor comparison; use the menu after all windows are visible.
const { app, BrowserWindow, Menu, screen } = require('electron');
const targeted = process.argv.includes('--targeted');
const windows = [];
app.whenReady().then(() => {
  console.log(JSON.stringify({ versions: process.versions, execPath: process.execPath, targeted }));
  for (const display of screen.getAllDisplays()) {
    const win = new BrowserWindow({ ...display.bounds, fullscreen: false });
    windows.push({ win, id: display.id });
    win.loadURL('data:text/html,' + encodeURIComponent(`<h1>Target display ${display.id}</h1>`));
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: 'Comparison', submenu: [
    { label: 'Request fullscreen after mapping', click: () => {
      for (const { win, id } of windows) {
        if (targeted) {
          if (typeof win.setFullScreenOnDisplay !== 'function') throw new Error('Patched runtime required');
          console.log(JSON.stringify({ id, submitted: win.setFullScreenOnDisplay(id) }));
        } else {
          const display = screen.getAllDisplays().find(d => d.id === id);
          if (!display) throw new Error('Display disconnected');
          win.setBounds(display.bounds);
          win.setFullScreen(true);
        }
      }
    } },
    { label: 'Leave fullscreen', click: () => windows.forEach(({ win }) => win.setFullScreen(false)) },
    { role: 'quit' }
  ] }]));
});
app.on('window-all-closed', () => app.quit());
