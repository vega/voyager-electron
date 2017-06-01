const electron = require('electron')
const { dialog, ipcMain } = require('electron')

const fs = require('fs');


require('electron-debug')({showDevTools: true});
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const Menu = electron.Menu;

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768})
  const menuTemplate = [
    {},
    {
      label: 'File',
      role: 'window',
      submenu: [
        {
          label: 'Open',
          click: () => {
              openAction();
          }
        },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const dataQueue = [];

let RENDERER_READY = false;
ipcMain.on('status', (event, arg) => {
  console.log('renderer is', 'ready')
  if (arg == 'ready') {
    RENDERER_READY = true;
    if (dataQueue.length > 0) {
      console.log('sending pending data');
      dataQueue.forEach((datum) => {
        mainWindow.webContents.send("data", datum);
      })
    }
  }
})




function openAction() {
  const options = {
    filters: [
      {name: 'JSON Files', extensions: ['json']}
    ]
  };

  dialog.showOpenDialog(mainWindow, {}, (filenames) => {
    if(filenames.length > 0) {
      const fp = filenames[0];
      fs.readFile(fp, (err, data) => {
        if (err) throw err;
        const parsed = JSON.parse(data);

        const res = {
          "values": parsed
        }

        if (RENDERER_READY) {
          mainWindow.webContents.send("data", res);
        } else {
          dataQueue.push(res);
        }


      });
    }
  })
}