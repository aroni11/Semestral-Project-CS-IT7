import { INode } from '../api/schema/node';
import { IWay } from '../api/schema/way';
import nodesToVertices from './helpers/nodes-to-vertices';
import isOneWay from './helpers/one-way';
import Edge from './models/edge';
import EdgeCost from './models/edgecost';
import Graph from './models/graph';

/**
 * Graph builder, taking an array of nodes and ways.
 * Workflow is:
 * - Convert nodes to vertices
 * - Add vertices to graph
 * - For each way:
 * - - Iterate over nodes of way in pairs
 * - - Add every succeeding node to the neighbors of the previous
 * - - Every neighbor also has costs associated
 * - - If the road is not one-way, also add the previous node to the neighbors of successor
 *
 * @param nodes
 * @param ways
 */
export default (nodes: INode[], ways: IWay[]): Graph => {
  const vertices = nodesToVertices(nodes);
  const graph = new Graph();

  graph.addVertex(...vertices);

  for (const way of ways) {
    const oneway = isOneWay(way);
    const nodeIds = way.loc.nodes;

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const v1 = graph.getVertex(nodeIds[i]);
      const v2 = graph.getVertex(nodeIds[i + 1]);
      const tags: any = way.tags;

      const cost = new EdgeCost(v1, v2, tags['highway']);

      if (!oneway) {
        v2.addNeighbor(new Edge(v1, cost));
      }
      v1.addNeighbor(new Edge(v2, cost));
    }
  }

  return graph;
};
