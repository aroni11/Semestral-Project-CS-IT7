import EdgeCost from './edgecost';
import Vertex from './vertex';

export default class Edge {
  static equal(edge1: Edge, edge2: Edge): boolean {
    return edge1.vertex.id === edge2.vertex.id
        && EdgeCost.equal(edge1.costs, edge2.costs);
  }

  vertex: Vertex;
  costs: EdgeCost;

  constructor(vertex: Vertex, costs: EdgeCost) {
    this.vertex = vertex;
    this.costs = costs;
  }
}
