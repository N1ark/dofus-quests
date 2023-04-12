import { highlight } from './script.js';

let cy = null;
const resultBox = document.querySelector("#results");

function setup(cytoscape) {
  cy = cytoscape;

  document.querySelector('#search').addEventListener('input', updateSearch);
}

function updateSearch(event){
  resultBox.innerHTML = "";

  const value = event.target.value.trim();
  if(!value) return;

  const nodes = cy.nodes(`[name @*= "${value}"]`);
  nodes.forEach(n => {
    const button = document.createElement("button");
    button.node = n;
    button.onclick = pressedResult;
    button.innerHTML = n.data("name");
    const result = document.createElement("div");
    result.className = `result ${n.data("type")}`;
    result.appendChild(button);
    resultBox.appendChild(result);
  });
}

function pressedResult(event) {
  highlight(event.target.node);
}

export { setup }
