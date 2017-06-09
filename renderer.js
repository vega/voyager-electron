const libVoyager = require('voyager');
const { ipcRenderer } = require('electron');

const config = {
  showDataSourceSelector: false,
};
let data;

const container = document.getElementById('voyager-embed');
const voyagerInstance = libVoyager.CreateVoyager(container, config, data);


// Set up drag and drop
const dragTarget = document.getElementById('title-area');
dragTarget.ondragover = function handleOnDragOver() {
  return false;
};

dragTarget.ondragleave = function handleDragLeave() {
  return false;
};

dragTarget.ondrop = function handleOnDrop(e) {
  e.preventDefault();
  console.log('event', e);
  const file = e.dataTransfer.files[0];
  console.log('file', file);
  return false;
};



setTimeout(() => {
  // Tell main thread we are ready.
  ipcRenderer.send('status', 'ready');
}, 50);

// Channel to receive data from main thread.
ipcRenderer.on('data', (event, arg) => {
  data = arg;
  voyagerInstance.updateData({
    values: data,
  });
});
