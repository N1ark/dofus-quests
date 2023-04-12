import { almanax } from './data.js';

function getDay() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth()+1;
  let formatted = "";
  formatted += day < 10 ? ("0"+day) : day;
  formatted += '/';
  formatted += month < 10 ? ("0"+month) : month;
  return formatted;
}

function getTodaysEntry() {
  const day = getDay();
  const entry = almanax[day];
  return entry;
}

function setup() {
  const entry = getTodaysEntry();
  const day = getDay();

  const date = document.querySelector('#almanax .date');
  date.innerText = day;

  const questName = document.querySelector('#almanax .quest-name');
  questName.innerText = entry.quest;

  const icon = document.querySelector('#almanax .item-icon');
  icon.src = `https://api.dofusdb.fr/img/items/${entry.itemImage}.png`;;

  const itemInfo = document.querySelector('#almanax .item-info');
  itemInfo.innerText = entry.offering

  const bonusType = document.querySelector('#almanax .bonus-type');
  bonusType.innerText = entry.type;

  const bonusInfo = document.querySelector('#almanax .bonus-info');
  bonusInfo.innerText = entry.effect;
}

setup();
