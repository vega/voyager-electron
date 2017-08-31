require('font-awesome-sass-loader');
const libVoyager = require('datavoyager');
const { ipcRenderer, remote } = require('electron');

let serverUrl = null;
if (remote.process.argv.includes('--server')) {
  serverUrl = 'http://localhost:3000';
}

const config = {
  showDataSourceSelector: false,
  serverUrl,
};

const voyagerInstance = libVoyager.CreateVoyager('#voyager-embed', config, undefined);

setTimeout(() => {
  // Tell main thread we are ready.
  ipcRenderer.send('status', 'ready');
}, 50);


// Handle data updates
ipcRenderer.on('data', (event, data, filename) => {
  voyagerInstance.setFilename(filename);
  voyagerInstance.updateData({
    values: data,
  });
});

// Handle spec updates
ipcRenderer.on('spec', (event, spec, filename) => {
  voyagerInstance.setFilename(filename);
  voyagerInstance.setSpec(spec);
});


// Handle application state updates and requests
ipcRenderer.on('applicationState', (event, arg) => {
  const { msg, payload } = arg;

  switch (msg) {
    case 'getState':
      ipcRenderer.send('applicationState', {
        msg: 'getState',
        payload: voyagerInstance.getApplicationState(),
      });
      break;
    case 'setState':
      voyagerInstance.setApplicationState(payload);
      break;
    default:
      break;
  }
});
