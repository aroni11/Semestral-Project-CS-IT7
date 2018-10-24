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
    this.id = node.id;
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
