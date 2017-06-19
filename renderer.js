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


ipcRenderer.on('data', (event, arg) => {
  data = arg;
  voyagerInstance.updateData({
    values: data,
  });
});


let snapshot;
function setupButtonHandlers() {
  const takeSnapshotButton = document.getElementById('take-snapshot');
  const restoreSnapshotButton = document.getElementById('restore-snapshot');


  takeSnapshotButton.addEventListener('click', () => {
    snapshot = voyagerInstance.getApplicationState();
    console.log('Snapshot taken', snapshot);
  });

  restoreSnapshotButton.addEventListener('click', () => {
    console.log('Restore snapshot', snapshot);
    voyagerInstance.setApplicationState(snapshot);
  });
}


setupButtonHandlers();
