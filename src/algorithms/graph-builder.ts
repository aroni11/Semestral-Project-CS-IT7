import { INode } from '../api/schema/node';
import { IWay } from '../api/schema/way';
import EdgeCost from './models/edgecost';
import Graph from './models/graph';
import Vertex from './models/vertex';

const nodesToVertices = (nodes: INode[]): Vertex[] => {
  const vs = [];
  for (const node of nodes) {
    vs.push(new Vertex(node));
  }
  return vs;
};

export default (nodes: INode[], ways: IWay[]): Graph => {
  const vertices = nodesToVertices(nodes);
  const graph = new Graph();
  graph.addVertex(...vertices);
  return graph;
};
