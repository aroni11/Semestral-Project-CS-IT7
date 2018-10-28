import { INode } from '../../api/schema/node';
import EdgeCost from './edgecost';

/**
 * Vertices represent geographical points of interest
 */
class Vertex {
  /**
   * Mongo ID.
   */
  id: number;
  /**
   * Latitude coordinate
   */
  lat: number;
  /**
   * Longitudinal coordinate
   */
  lng: number;
  /*
  * Number of edges directed TO this Vertex
  */
  inDegree = 0;
  /**
   * Array containing all neighbors of a Vertex, including associated edge
   */
  neighbors?: Set<{
    vertex: Vertex;
    costs: EdgeCost
  }> = new Set();

  constructor(node: INode) {
    this.lng = node.loc.coordinates[0];
    this.lat = node.loc.coordinates[1];
    this.id = node._id;
  }

  /*
   * Number of edges directed FROM this Vertex
   * Counted as the number of neighbors.
  */
  get outDegree(): number {
    return this.neighbors.size;
  }

  /**
   * Add a neighbor with edge
   */
  addNeighbor(costs: EdgeCost, vertex: Vertex): void {
    this.neighbors.add({
      costs,
      vertex
    });
    vertex.inDegree += 1;
  }

  /**
   * Remove a neighbor of this vertex
   * Outcoming edge of h=this vertex has to be passed as a parameter. The edge that matches the passed one will be
   * removed from the neighbors array, therefore neighbor is removed.
   * @param edge Edge to a neighbor that will be removed
   */
  removeNeighbor(edge: {vertex: Vertex, costs: EdgeCost}): void {
    this.neighbors.delete(edge);
    edge.vertex.inDegree -= 1;
  }
}

export default Vertex;

export const nodesToVertices = (nodes: INode[]): Vertex[] => {
  const vs = [];
  for (const node of nodes) {
    vs.push(new Vertex(node));
  }
  return vs;
};
