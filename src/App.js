import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import * as cola from 'webcola';
import './App.css';
const { d3adaptor } = cola


const size = 2400;
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
  { id: 17, level: 4, r: 8 },
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

const newNodes = [];
var random = 222;

const loadData = () => {
  return { nodes, links };
};


class App extends React.Component {
  svg = null;

  componentDidMount() {
    this.initialize();
  }

  initialize() {
    const d3Cola = d3adaptor(d3).avoidOverlaps(true).size([size, size]);

    let svg = this.svg;
    if (!this.svg) {
      const nodeHTML = document.querySelector("#d3Node");
      svg = (this.svg = d3.select(nodeHTML).append("svg"));
    }

    svg
      .attr("viewBox", `0 0 ${size} ${size}`)
      .style("width", "100%")
      .style("height", "auto");

    const constraints = [];
    const { nodes, links } = loadData();
    const groups = _.groupBy(nodes, "level");

    // create x/y constraint to align the nodes. store into "constraints" var
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
            gap: 240,
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
      .handleDisconnected(true)
      .flowLayout("y", 150)
      .linkDistance(80)
      .symmetricDiffLinkLengths(40)
      .avoidOverlaps(true)
      .start(50, 50, 150);

    // get references of links entities
    let linkData = svg
      .selectAll("line")
      .data(links);
    linkData.exit().remove(); // clean up if a node has been deleted in source data.

    // handle new link entities from data source
    let linkEnter = linkData
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + 80)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + 80)
      .attr("stroke", "grey")
      .attr("stroke-width", 1);
    let link = linkData.merge(linkEnter)


    // get references of nodes entities
    let nodeData = svg
      .selectAll("circle")
      .data(nodes);
    nodeData.exit().remove(); // clean up if a node has been deleted in source data.

    // handle new node entities from data source
    let nodeEnter = nodeData
      .enter()
      .append("circle")
      .attr("fill", (d) => level2Colors(d.level))
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y + 80)
      .attr("r", (d) => 50);
    let node = nodeData.merge(nodeEnter)
    node
      .call(d3Cola.drag); // all nodes should have draggable handler.


    // on every tick, update the d3 object node/link attribute corresponding with canvas entity
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

  action1 = () => {
    const newNode = {
      id: random,
      level: 2,
      r: 8
    }
    nodes.push(newNode)
    links.push({
      source: nodes[0],
      target: newNode
    })
    newNodes.push(newNode);
    this.initialize()
    random += 1;
  }

  action2 = () => {
    if (newNodes.length === 0) return;

    const thisNode = newNodes[0]
    const thisLinkIndex = links.findIndex( e => e.target.id === thisNode.id);
    const thisNodeIndex = nodes.findIndex( e => e.id === thisNode.id);

    links.splice(thisLinkIndex, 1)
    nodes.splice(thisNodeIndex, 1)
    newNodes.splice(0,1)

    this.initialize()
  }

  render() {
    return (
      <div>
        <button
          style={{
            position: "fixed",
            top: 0,
            height: 50,
            width: 200,
          }}
          onClick={this.action1}
        > add random level:2 node
        </button>

        <button
          style={{
            position: "fixed",
            top: 0,
            left: 250,
            height: 50,
            width: 200,
          }}
          onClick={this.action2}
        > remove random level:2 node
        </button>

        <div id="d3Node" className="d3-component"></div>
      </div>
    )
  }
}

export default App;
