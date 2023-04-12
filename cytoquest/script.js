import { style, layout } from './cytostyle.js';
import { setup as searchSetup } from './search.js';
import { setup as hideFinishedSetup } from './filter-finished.js';
import { updateHideFinished } from './filter-finished.js';
import { addNodes, removeNodes, getData } from './storage.js';

let cy = null;
const animationEasing = 'ease';
const animationDuration = 500;

let highlightInProgress = false;
let lastZoom = null;
let lastPan = null;
let lastHighlighted = null;
let lastUnhighlighted = null;
let baseData = null;
let currentCheckbox = null;

function displayData(){

  cy = cytoscape({
    container: document.getElementById('cy'),
    elements: data,
    style: style
  });

  searchSetup(cy);
  hideFinishedSetup(cy);

  resetView()

  cy.promiseOn('layoutstop').then(() => {
    if(window.location.hash) {
      highlightFromHash();
    }
  });

  window.onhashchange = () => {
    if(!highlightInProgress){
      if(window.location.hash)
        highlightFromHash();
      else
        unhighlight();
    }
  }

  document.querySelector("#reorganise-button").onclick = reorganiseAll;

  cy.unbind('tap');
  cy.bind('tap', e => {
    if(e.target === cy ) unhighlight();
    else if(e.target.isNode()) highlight(e.target);
  });

  cy.on('cxttap', 'node', event => {
    const shift = event.originalEvent.shiftKey;
    flipFinished(event.target, shift);
  });
  // cy.on('scrollzoom', event => {
  //   console.log(event);
  // });
}

const delayPromise = duration => new Promise(resolve => setTimeout(resolve, duration));

const getOrgPos = n => Object.assign({}, n.data('orgPos'));

function highlightFromHash() {
  const nodeId = window.location.hash.split("#")[1];
  const node = cy.nodes(`[id = "${nodeId}"]`);
  if(node.length > 0){
    highlight(node[0]);
  }
}

function highlight(node) {

  highlightInProgress = true;

  if(lastHighlighted == null) {
    lastZoom = cy.zoom();
    lastPan = Object.assign({}, cy.pan());
  }

  const allEles = cy.elements();
  const nhood = lastHighlighted = node.predecessors().add(node);
  const others = lastUnhighlighted = allEles.not( nhood );

  window.location.hash = node.id();

  const showOverview = () => {
    cy.batch(() => {
      allEles.removeClass('faded highlighted hidden');

      nhood.addClass('highlighted');
      others.addClass('hidden');

      others.positions(getOrgPos);
    });

    const layout = nhood.layout({
      name: 'preset',
      positions: getOrgPos,
      fit: true,
      animate: true,
      animationDuration: animationDuration,
      animationEasing: animationEasing
    });

    layout.run();

    return layout.promiseOn('layoutstop');
  };

  const runLayout = () => {
    const p = getOrgPos(node);

    const aLayout = nhood.layout(layout);

    const promise = aLayout.promiseOn('layoutstop');
    aLayout.run();
    return promise;
  };

  const showOthersFaded = () => {
    cy.batch(() => {
      others.removeClass('hidden').addClass('faded');
    });
  };

  const showInfo = () => {
    showInfoBox(node);
    return Promise.resolve();
  }


  return (
    Promise.resolve()
    .then( showInfo )
    .then( showOverview )
    .then( () => delayPromise(animationDuration/2) )
    .then( runLayout )
    .then( showOthersFaded )
    .then( () => highlightInProgress = false)
  );

}

function unhighlight() {
  if( lastHighlighted == null ){ return Promise.resolve(); }

  window.location.hash = '';

  const allEles = cy.elements();
  const allNodes = cy.nodes();

  cy.stop();
  allNodes.stop();

  const nhood = lastHighlighted;
  const others = lastUnhighlighted;

  lastHighlighted = lastUnhighlighted = null;

  const hideOthers = function(){
    others.addClass('hidden');

    return Promise.resolve();
  };

  const resetClasses = function(){
    cy.batch(() => {
      allEles.removeClass('hidden').removeClass('faded').removeClass('highlighted');
    });

    return Promise.resolve();
  };

  const animateToOrgPos = function( nhood ){
    return Promise.all( nhood.nodes().map(n => {
      return n.animation({
        position: getOrgPos(n),
        duration: animationDuration,
        easing: animationEasing
      }).play().promise();
    }) );
  };

  const restorePositions = () => {
    cy.batch(() => {
      others.nodes().positions(getOrgPos);
    });

    return animateToOrgPos( nhood.nodes() );
  };

  const restoreCyView = () => {
    return cy.animation({
      zoom: lastZoom,
      pan: lastPan
    }).play().promise();
  }

  const hideInfoBox = () => {
    document.querySelector('#info-box').classList.add("hidden");
    return Promise.resolve();
  }

  return (
    Promise.resolve()
    .then( hideInfoBox )
    .then( resetClasses )
    .then( restoreCyView )
    .then( restorePositions )
  );
}

function showInfoBox(node) {
  const infoBox = document.querySelector('#info-box');
  infoBox.innerHTML = "";

  const title = document.createElement("h1");
  title.innerText = node.data("name");
  infoBox.appendChild(title);

  const description = document.createElement("p");
  if(description) {
    description.innerText = node.data("description");
    infoBox.appendChild(description);
  }

  const requirements = document.createElement("p");
  requirements.innerText = node.data("requirements");
  infoBox.appendChild(requirements);

  const divFinished = document.createElement('div');
  divFinished.className = 'finish-bar';

  const label = document.createElement('label');
  label.className = 'switch';
  const checkbox = document.createElement('input');
  currentCheckbox = checkbox;
  checkbox.type = 'checkbox';
  checkbox.nodeId = node.id();
  checkbox.checked = node.hasClass('finished');
  checkbox.onclick = () => flipFinished(node, false);
  const slider = document.createElement('span');
  slider.className = 'slider round';
  label.appendChild(checkbox);
  label.appendChild(slider);
  divFinished.appendChild(label);

  const buttonFinishedPred = document.createElement('button');
  buttonFinishedPred.innerText = 'Marquer Prérequis';
  buttonFinishedPred.onclick = () => flipFinished(node, true)
  divFinished.appendChild(buttonFinishedPred);

  infoBox.appendChild(divFinished);

  const link = document.createElement("a");
  link.innerText = "Plus d'infos";
  const urlEnd = node.id().replace("q", "quest/")
                          .replace("a", "achievements/");
  link.href = `https://dofusdb.fr/fr/database/${urlEnd}`;
  infoBox.appendChild(link);

  infoBox.classList.remove("hidden");
}

function flipFinished(node, predecessors) {
  const isFinished = node.hasClass('finished');

  if(currentCheckbox && currentCheckbox.nodeId == node.id())
    currentCheckbox.checked = !isFinished

  let nodes = node;
  if(predecessors)
    nodes = node.predecessors().add(node).filter('node');
  const nodeIds = nodes.map(n => n.id());

  if(isFinished) removeNodes(nodeIds);
  else addNodes(nodeIds);

  updateFromStorage();
}

function updateFromStorage() {
  const nodeIds = getData();
  const filterExp = nodeIds.map(x => `[id = "${x}"]`).join(', ');
  let nodes = cy.nodes().filter(filterExp);
  const otherNodes = cy.nodes().not(nodes);

  nodes.addClass('finished');
  otherNodes.removeClass('finished');
}

function reorganiseAll() {
  cy.minZoom(0);
  const elements = cy.elements(':visible');
  elements.layout(layout).run();
  cy.promiseOn('layoutstop').then(() => {
    // cy.fit(cy.elements(':visible'));
    cy.minZoom(cy.zoom());
    cy.maxZoom(3.5);
    cy.batch( () => {
      cy.nodes().forEach(node => {
        const pos = node.position();
        node.data('orgPos', {x: pos.x, y: pos.y});
      });
    });
  });
}

function resetView() {
    updateFromStorage();
    updateHideFinished();
    reorganiseAll();
}

export { cy, displayData, highlight, resetView }
