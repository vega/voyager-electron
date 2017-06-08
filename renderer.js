const libVoyager = require('voyager');
const { ipcRenderer } = require('electron')

const config = {
  showDataSourceSelector: false,
}
let data;

const voyagerInstance = libVoyager.CreateVoyager("#voyager-embed", config, data)

setTimeout(() => {
  // Tell main thread we are ready.
  ipcRenderer.send('status', 'ready')
}, 50);


ipcRenderer.on('data', (event, arg) => {
  data = arg;
  voyagerInstance.updateData(data);
})



