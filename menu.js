const electron = require('electron');

const BrowserWindow = electron.BrowserWindow;

function isDarwin() {
  return process.platform === 'darwin';
}

function addDarwinMenuItems(app, menuTree) {
  const name = electron.app.getName();
  menuTree.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about',
    }, {
      type: 'separator',
    }, {
      label: 'Services',
      role: 'services',
      submenu: [],
    }, {
      type: 'separator',
    }, {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide',
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers',
    }, {
      label: 'Show All',
      role: 'unhide',
    }, {
      type: 'separator',
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      },
    }],
  });

  // Window menu.
  menuTree[3].submenu.push({
    type: 'separator',
  }, {
    label: 'Bring All to Front',
    role: 'front',
  });

  return menuTree;
}


function createMenuTree(app, handlers) {
  const menuTree = [
    {
      label: 'File',
      role: 'window',
      submenu: [
        {
          label: 'Open',
          click: handlers.handleOpen,
        },
        {
          label: 'Save Session',
          click: handlers.handleTakeSession,
        },
        {
          label: 'Load Session',
          click: handlers.handleRestoreSession,
        },
        {
          label: 'Load Vega Lite Spec',
          click: handlers.handleLoadSpec,
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              // on reload, start fresh and close any old open secondary windows
              if (focusedWindow.id === 1) {
                BrowserWindow.getAllWindows().forEach((win) => {
                  if (win.id > 1) {
                    win.close();
                  }
                });
              }
              focusedWindow.reload();
            }
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: isDarwin() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.toggleDevTools();
            }
          },
        },
        {
          type: 'separator',
        },
      ],
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize',
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
        {
          type: 'separator',
        },
        {
          label: 'Reopen Window',
          accelerator: 'CmdOrCtrl+Shift+T',
          enabled: false,
          key: 'reopenMenuItem',
          click() {
            app.emit('activate');
          },
        },
      ],
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            electron.shell.openExternal('https://github.com/vega/voyager');
          },
        },
      ],
    },
  ];

  if (isDarwin) {
    addDarwinMenuItems(app, menuTree);
  }

  return menuTree;
}


module.exports = createMenuTree;
