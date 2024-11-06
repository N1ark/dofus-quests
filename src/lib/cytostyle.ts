export const QUEST_COLOR = `#256FD1`
export const QUEST_COLOR_FINISHED = `#3DD17D`
export const ACHIEVEMENT_COLOR = `#E0961F`
export const ACHIEVEMENT_COLOR_FINISHED = `#A0D13D`

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

node.outlined {
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

.hidden {
	display: none;
}
`
