export const QUEST_COLOR = `#256FD1`
export const QUEST_COLOR_FINISHED = `#3DD17D`
export const ACHIEVEMENT_COLOR = `#E0961F`
export const ACHIEVEMENT_COLOR_FINISHED = `#A0D13D`
export const GROUP_COLORS = {
    // Atoll des Possédés:
    123: '#1A5152',
    // Alignement:
    43: '#FFDE4F',
    // Île d'Otomaï:
    50: '#1E3719',
    // Incarnam:
    53: '#49617B',
    // Archipel des Écailles:
    99: '#ABE4C9',
    // Bonta et Brâkmar:
    46: '#912B30',
    // Archipel de Valonia:
    140: '#3B493C',
    // Camps des Bworks et des Gobelins:
    47: '#ABB0DB',
    // Saharach:
    74: '#E3C371',
    // Montagne des Koalaks:
    54: '#B19741',
    // Justiciers:
    61: '#7E3123',
    // Général:
    118: '#E4C721',
    // Avis de recherche:
    42: '#F1E8C5',
    // Nimotopia:
    55: '#FC9FA5',
    // Cauchemar des Ravageurs:
    125: '#6B6F6E',
    // Royaume d'Amakna:
    146: '#D0812E',
    // Krosmoz:
    44: '#B727CE',
    // Cania:
    48: '#CBB937',
    // Almanax:
    26: '#FF6F5B',
    // Île de Moon:
    70: '#262B05',
    // Île de Pandala:
    114: '#686E2C',
    // Sidimote:
    76: '#8E3E0C',
    // Quêtes principales:
    40: '#FFFE31',
    // Dimensions Divines:
    65: '#C8678E',
    // Astrub:
    45: '#AD8030',
    // Sufokia:
    58: '#102C3A',
    // Île de Frigost:
    51: '#B5FFEF',
    // Eliocalypse:
    102: '#D282E9',
    // Île des Wabbits:
    52: '#F99A39',
    // Tours de la Fratrie:
    77: '#FF7E16',
    // Forêt Maléfique:
    128: '#2C370C',

    // CUSTOM:
    // Dofus:
    1001: '#C9FF30',
    // Tour du monde:
    1002: '#86D9ED',
}

// ${Object.entries(GROUP_COLORS)
//     .map(
//         ([id, color]) => `
// node[group = ${id}] {
//     background-color: ${color};
// }
// `
//     )
//     .join('')}

export const style = `
edge {
  curve-style: bezier;
  target-arrow-shape: triangle;
  arrow-scale: 1.3;
  opacity: 0.3;
  width: 3;
}

node {
  background-color: blue;
  label: data(name);
  text-wrap: wrap;
  font-size: 10;
  font-family: Inter, sans-serif;
  min-zoomed-font-size: 11;
	text-max-width: 100;
	text-valign: center;
	text-halign: center;
	text-events: yes;
	color: #fff;
  text-outline-color: blue;
	text-outline-width: 1;
	text-outline-opacity: 1;
}

node[type = "quest"] {
  background-color: ${QUEST_COLOR};
  text-outline-color: ${QUEST_COLOR};
}

node[type = "quest"].finished {
  background-color: ${QUEST_COLOR_FINISHED};
  text-outline-color: ${QUEST_COLOR_FINISHED};
}

node[type = "achievement"] {
  background-color: ${ACHIEVEMENT_COLOR};
  text-outline-color: ${ACHIEVEMENT_COLOR};
}

node[type = "achievement"].finished {
  background-color: ${ACHIEVEMENT_COLOR_FINISHED};
  text-outline-color: ${ACHIEVEMENT_COLOR_FINISHED};
}

node.highlighted {
  min-zoomed-font-size: 0;
  z-index: 9999;
}

edge[type = "AVAILABLE"] {
    line-color: #2bc899;
    target-arrow-color: #2bc899;
}
edge[type = "FINISHED"] {
    line-color: #29d35c;
    target-arrow-color: #29d35c;
}
edge[type = "NOT_FINISHED"] {
    line-color: #e14a4a;
    target-arrow-color: #e14a4a;
}
edge[type = "FINISHED_N_TIMES"] {
    line-color: #2bc899;
    target-arrow-color: #2bc899;
}
edge[type = "IN_PROGRESS"] {
    line-color: #e1cc4a;
    target-arrow-color: #e1cc4a;
}

edge.highlighted {
	opacity: 0.8;
	width: 4;
	z-index: 9999;
}

node.faded {
  background-opacity: 0.6;
  opacity: 0.6;
}

edge.faded {
  opacity: 0.3;
}

node.outlined, node:selected {
    outline-width: 2;
    border-width: 8;
    border-opacity: 0;
}

node[type = "quest"].outlined {
    outline-color: ${QUEST_COLOR};
}

node[type = "quest"].outlined.finished {
    outline-color: ${QUEST_COLOR_FINISHED};
}

node[type = "achievement"].outlined {
    outline-color: ${ACHIEVEMENT_COLOR};
}

node[type = "achievement"].outlined.finished {
    outline-color: ${ACHIEVEMENT_COLOR_FINISHED};
}

node:selected {
    outline-color: #fff;
}

.hidden {
	display: none;
}
`
