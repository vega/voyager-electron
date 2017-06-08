const path = require('path');
const fs = require('fs');

function loadJSON(fp) {
  const fileData = fs.readFileSync(fp);
  return JSON.parse(fileData);
}

function loadTSV(fp) {
  return undefined;
}

function load(fp) {
  const ext = path.extname(fp);
  if (ext === 'json') {
    return loadJSON(fp);
  } else if (ext === 'tsv') {
    return loadTSV();
  }
  return undefined;
}

module.exports = {
  load,
  loadJSON,
  loadTSV,
};
