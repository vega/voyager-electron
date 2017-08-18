const electron = require('electron');
const { dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const createMenuTree = require('./menu');
const loadData = require('./loadData');
require('electron-debug');

// Starts server with default options
if (process.argv.includes('--server')) {
  require('datavoyager-server/build/server'); // eslint-disable-line global-require
}


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

        const filename = fp.replace(/^.*[\\\/]/, '');

        // TODO Send 'loading' signal/message to renderer thread.
        const data = loadData.load(fp);
        if (RENDERER_READY) {
          mainWindow.webContents.send('data', data, filename);
        } else {
          // This may be overkill.
          dataQueue.push(data);
        }
      }
    });
  },

  handleLoadSpec: () => {
    const options = {
      properties: ['openFile'],
      filters: [
        {
          name: 'Vega Lite Specs',
          extensions: ['json'],
        },
      ],
    };

    dialog.showOpenDialog(mainWindow, options, (filenames) => {
      if (filenames && filenames.length > 0) {
        const fp = filenames[0];
        // TODO Send 'loading' signal/message to renderer thread.
        const spec = loadData.loadJSON(fp);

        // Here is where you can manipulate the spec and resolve any relative path issues.
        const filename = fp.replace(/^.*[\\\/]/, '');

        mainWindow.webContents.send('spec', spec, filename);
      }
    });
  },

  handleTakeSession: () => {
    mainWindow.webContents.send('applicationState', {
      msg: 'getState',
    });
  },

  handleRestoreSession: () => {
    const options = {
      properties: ['openFile'],
      filters: [
        {
          name: 'Session Files',
          extensions: ['json'],
        },
      ],
    };

    dialog.showOpenDialog(mainWindow, options, (filenames) => {
      if (filenames && filenames.length > 0) {
        const fp = filenames[0];
        const data = loadData.loadJSON(fp);
        if (RENDERER_READY) {
          mainWindow.webContents.send('applicationState', {
            msg: 'setState',
            payload: data,
          });
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

ipcMain.on('applicationState', (event, arg) => {
  const { msg, payload } = arg;

  switch (msg) {
    case 'getState':
      dialog.showSaveDialog(mainWindow, {
        defaultPath: 'snapshot.vy.json',
      },
      (filePath) => {
        if (filePath) {
          fs.writeFileSync(filePath, JSON.stringify(payload, null, '\t'));
        }
      });
      break;
    default:
      break;
  }
});
