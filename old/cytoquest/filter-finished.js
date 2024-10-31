import { hideFinished } from './storage.js';

let cy = null;
const hideCheckbox = document.querySelector("#show-finished");

function setup(cytoscape) {
  cy = cytoscape;
  hideCheckbox.addEventListener('change', updateHideFinished);

  const hiding = hideFinished();
  hideCheckbox.checked = hiding;
}

function updateHideFinished(){
  const hide = hideCheckbox.checked;
  hideFinished(hide);

  const finished = cy.nodes('.finished');
  const others = cy.nodes().not(finished);

  others.show();
  if(hide) finished.hide();
  else     finished.show();
}

export { setup, updateHideFinished }
