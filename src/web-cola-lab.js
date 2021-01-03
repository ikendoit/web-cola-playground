const size = 600;
const defaultRadius = 20;

const level2Colors = (level) => {
  const colors = {
    1: "#A01928",
    2: "#9F62A4",
    3: "#0B7A7A",
    4: "#3F3F38",
  };
  return colors[level];
};
const level2Rad = (level) => {
  return (defaultRadius * 2.5) / level;
};

const loadData = () => {
  const nodes = [
    { id: 1, level: 1, r: 8 },
    { id: 2, level: 2, r: 8 },
    { id: 3, level: 2, r: 8 },
    { id: 4, level: 2, r: 8 },
    { id: 5, level: 3, r: 8 },
    { id: 6, level: 3, r: 8 },
    { id: 7, level: 3, r: 8 },
    { id: 8, level: 3, r: 8 },
    { id: 9, level: 3, r: 8 },
    { id: 10, level: 3, r: 8 },
    { id: 11, level: 4, r: 8 },
    { id: 12, level: 4, r: 8 },
    { id: 13, level: 4, r: 8 },
    { id: 14, level: 4, r: 8 },
    { id: 15, level: 4, r: 8 },
    { id: 16, level: 4, r: 8 },
  ];

  const links = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 1, target: 4 },
    { source: 1, target: 5 },
    { source: 2, target: 6 },
    { source: 2, target: 7 },
    { source: 2, target: 8 },
    { source: 3, target: 4 },
    { source: 3, target: 8 },
    { source: 3, target: 9 },
    { source: 4, target: 10 },
    { source: 4, target: 11 },
    { source: 6, target: 12 },
    { source: 7, target: 13 },
    { source: 9, target: 14 },
    { source: 9, target: 15 },
    { source: 8, target: 15 },
  ];

  return { nodes, links };
};

const { d3adaptor } = cola

class App extends React.Component {
  svg = null;

  componentDidMount() {
    const node = document.querySelector("#d3Node");

    this.initialize(node);
  }

  initialize(node) {
    const d3Cola = d3adaptor(d3).avoidOverlaps(true).size([size, size]);
    const svg = (this.svg = d3.select(node).append("svg"));
    svg
      .attr("viewBox", `0 0 ${size} ${size}`)
      .style("width", "100%")
      .style("height", "auto");

    const constraints = [];
    const { nodes, links } = loadData();
    const groups = _.groupBy(nodes, "level");

    for (const level of Object.keys(groups)) {
      const nodeGroup = groups[level];
      const constraint = {
        type: "alignment",
        axis: "y",
        offsets: [],
      };
      let prevNodeId = -1;
      for (const node of nodeGroup) {
        constraint.offsets.push({
          node: _.findIndex(nodes, (d) => d.id === node.id),
          offset: 0,
        });

        if (prevNodeId !== -1) {
          constraints.push({
            axis: "x",
            left: _.findIndex(nodes, (d) => d.id === prevNodeId),
            right: _.findIndex(nodes, (d) => d.id === node.id),
            gap: 70,
          });
        }

        prevNodeId = node.id;
      }

      constraints.push(constraint);
    }

    d3Cola
      .nodes(nodes)
      .links(links)
      .constraints(constraints)
      .flowLayout("y", 150)
      .linkDistance(50)
      .symmetricDiffLinkLengths(40)
      .avoidOverlaps(true)
      .start(50, 50, 150);

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + 80)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + 80)
      .attr("stroke", "grey")
      .attr("stroke-width", 1);

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("fill", (d) => level2Colors(d.level))
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y + 80)
      .attr("r", function (d) {
        return level2Rad(d.level);
      })
      .call(d3Cola.drag);

    d3Cola.on("tick", () => {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y + 80;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y + 80;
        });

      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y + 80;
        });
    });
  }

  render() {
    return <div id="d3Node" className="d3-component"></div>;
  }
}

ReactDOM.render(<App />, document.querySelector('#root'))
