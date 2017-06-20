const libVoyager = require('datavoyager');
const { ipcRenderer } = require('electron');

const config = {
  showDataSourceSelector: false,
};
let data;

const voyagerInstance = libVoyager.CreateVoyager('#voyager-embed', config, data);

setTimeout(() => {
  // Tell main thread we are ready.
  ipcRenderer.send('status', 'ready');
}, 50);


// Handle data updates
ipcRenderer.on('data', (event, arg) => {
  data = arg;
  voyagerInstance.updateData({
    values: data,
  });
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