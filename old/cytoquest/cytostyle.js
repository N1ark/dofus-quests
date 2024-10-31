
const animationEasing = 'ease';
const animationDuration = 500;

const layout = {
  name: 'elk',
  elk: {
    algorithm: 'layered',
    'elk.direction': 'DOWN'
  },
  nodeDimensionsIncludeLabels: true,
  animate: true,
  animationDuration: animationDuration,
  animationEasing: animationEasing
};

const style = `
edge {
  curve-style: bezier;
  target-arrow-shape: triangle;
  line-color: data(favColor);
  target-arrow-color: data(favColor);
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
`;

export { layout, style };
