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
  background-color: #256FD1;
  text-outline-color: #256FD1;
}

node[type = "quest"].finished {
  background-color: #3DD17D;
  text-outline-color: #3DD17D;
}

node[type = "achievement"] {
  background-color: #E0961F;
  text-outline-color: #E0961F;
}

node[type = "achievement"].finished {
  background-color: #A0D13D;
  text-outline-color: #A0D13D;
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

.faded {
  events: no;
}

node.faded {
  opacity: 0.08;
}

edge.faded {
  opacity: 0.06;
}

.hidden {
	display: none;
}
`
