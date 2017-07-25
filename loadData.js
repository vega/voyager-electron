const path = require('path');
const fs = require('fs');
const d3Dsv = require('d3-dsv');
const chardet = require('jschardet');


function loadString(fp) {
  const fileBuffer = fs.readFileSync(fp);
  const encoding = chardet.detect(fileBuffer);
  const data = fileBuffer.toString(encoding.encoding);
  return data;
}

function loadJSON(fp) {
  const data = loadString(fp);
  return JSON.parse(data);
}

function loadTSV(fp) {
  const data = loadString(fp);
  return d3Dsv.tsvParse(data);
}

function loadCSV(fp) {
  const data = loadString(fp);
  return d3Dsv.csvParse(data);
}

function load(fp) {
  const ext = path.extname(fp);
  if (ext === '.json') {
    return loadJSON(fp);
  } else if (ext === '.tsv') {
    return loadTSV(fp);
  } else if (ext === '.csv') {
    return loadCSV(fp);
  }
  return undefined;
}

module.exports = {
  load,
  loadJSON,
  loadCSV,
};
