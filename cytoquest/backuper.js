import { getRawData, saveRawData } from './storage.js';
import { resetView } from './script.js';

function setup() {
  document.querySelector('#export-button').onclick = showExportView;
  document.querySelector('#import-button').onclick = showImportView;
}

function showExportView() {
  const body = document.querySelector('body');

  const popup = document.createElement('div');
  popup.className = 'popup';
  const popupContent = document.createElement('div');
  popupContent.className = 'popup-content';

  const close = document.createElement('button');
  close.className = 'fancy-button close-button';
  close.innerText = 'Close';

  const title = document.createElement('h1');
  title.innerText = 'Export Data';

  const subtitle = document.createElement('p');
  subtitle.innerText = 'Copy this text and save it somewhere safely - you can then use the "Import" feature to load it back.';

  const content = document.createElement('textarea');
  content.readOnly = true;
  content.innerText = getRawData();

  popupContent.appendChild(close);
  popupContent.appendChild(title);
  popupContent.appendChild(subtitle);
  popupContent.appendChild(content);

  popup.appendChild(popupContent);

  body.appendChild(popup);

  close.onclick = () => popup.remove();
}

function showImportView() {
  const body = document.querySelector('body');

  const popup = document.createElement('div');
  popup.className = 'popup';
  const popupContent = document.createElement('div');
  popupContent.className = 'popup-content';

  const close = document.createElement('button');
  close.className = 'fancy-button close-button';
  close.innerText = 'Close';

  const title = document.createElement('h1');
  title.innerText = 'Import Data';

  const subtitle = document.createElement('p');
  subtitle.innerText = 'Paste here your save data, and click the "Load" ' +
                       'button to load it into the app! This will override ' +
                       'the previous data, and save whatever you\'re loading ' +
                       'instead, so backup your data first if you care about ' +
                       'it!';

  const content = document.createElement('textarea');
  content.readOnly = false;
  content.innerText = '';

  const save = document.createElement('button');
  save.className = 'fancy-button large-button';
  save.innerText = 'Load';

  popupContent.appendChild(close);
  popupContent.appendChild(title);
  popupContent.appendChild(subtitle);
  popupContent.appendChild(content);
  popupContent.appendChild(save);

  popup.appendChild(popupContent);

  body.appendChild(popup);

  close.onclick = () => popup.remove();
  save.onclick = () => saveFromImportData(content, popup);
}

function saveFromImportData(content, popup) {
  saveRawData(content.value);
  popup.remove();
  resetView();
}


export default setup;
export { setup };
