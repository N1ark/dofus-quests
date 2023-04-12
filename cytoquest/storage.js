
function getRawData() {
  return localStorage.finishedQuests;
}

function getData() {
  const savedData = getRawData();
  if(!savedData) return [];

  try { // parse, in case it works for odler versions
    const parsed = JSON.parse(savedData);
    return parsed;
  } catch (e) {} // not json, --> decompress

  const uncompressed = LZString.decompressFromBase64(savedData);
  const parsed = JSON.parse(uncompressed);
  return parsed;
}

function saveRawData(data) {
  localStorage.finishedQuests = data;
}

function saveData(list) {
  const json = JSON.stringify(list);
  const compressed = LZString.compressToBase64(json);
  saveRawData(compressed);
}

function addNodes(nodes) {
  let data = getData();
  data = data.concat(nodes);
  data = [...new Set(data)];
  saveData(data);
}

function removeNodes(nodes) {
  let data = getData();
  data = data.filter(e => !nodes.includes(e));
  saveData(data);
}

function hideFinished(hide) {
  if(hide !== undefined) {
    localStorage.hideFinished = hide ? '1' : '0';
  }
  return localStorage.hideFinished == '1';
}

export { addNodes, removeNodes, getData, hideFinished, getRawData, saveRawData }
