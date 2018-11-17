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
  neighbors?: Array<{
    vertex: Vertex;
    costs: EdgeCost
  }> = [];

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
    return this.neighbors.length;
  }

  /**
   * Add a neighbor with edge
   */
  addNeighbor(costs: EdgeCost, vertex: Vertex): void {
    this.neighbors.push({
      costs,
      vertex
    });
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
