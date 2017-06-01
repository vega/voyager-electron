const libVoyager = require('voyager');
const { ipcRenderer } = require('electron')


const container = document.getElementById("voyager-embed");
console.log("Hello from renderer", libVoyager, container)
const voyagerInstance = libVoyager.CreateVoyager("#voyager-embed", undefined, undefined)

//send a message to the main thread that we are ready.
ipcRenderer.send('status', 'ready')

ipcRenderer.on('data', (event, arg) => {
  console.log('got new data', arg)
  voyagerInstance.updateData(arg);
})



