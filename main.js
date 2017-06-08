const electron = require('electron');
const { dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const createMenuTree = require('./menu');
const loadData = require('./loadData');
require('electron-debug');

const app = electron.app;
const Menu = electron.Menu;
let mainWindow;

let RENDERER_READY = false;

let dataQueue = [];

//
//  Menu Related Event Handlers
//

const handlers = {
  handleOpen: () => {
    const options = {
      properties: ['openFile'],
      filters: [
        {
          name: 'Data Files',
          extensions: ['json', 'csv', 'tsv'],
        },
      ],
    };

    dialog.showOpenDialog(mainWindow, options, (filenames) => {
      if (filenames && filenames.length > 0) {
        const fp = filenames[0];
        const data = loadData.load(fp);
        if (RENDERER_READY) {
          mainWindow.webContents.send('data', data);
        } else {
          dataQueue.push(data);
        }
      }
    });
  },
};

//
// Initialize the app
//

function createWindow() {
  // Create the browser window.
  mainWindow = new electron.BrowserWindow({ width: 1024, height: 768 });

  // Setup the menu
  const menuTemplate = createMenuTree(app, handlers);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


//
// Communication between main thread and renderer thread.
//

ipcMain.on('status', (event, arg) => {
  if (arg === 'ready') {
    RENDERER_READY = true;
    if (dataQueue.length > 0) {
      dataQueue.forEach((datum) => {
        mainWindow.webContents.send('data', datum);
      });
      dataQueue = [];
    }
  }
});
