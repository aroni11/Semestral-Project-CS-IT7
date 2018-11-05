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

  /**
   * Method verifies whether there is an edge back from the 'from' vertex back to this vertex
   * If there is at least one edge from 'from' vertex' to this vertex true is returned. Otherwise false.
   * @param from : Vertex Vertex to get back from
   * @return boolean
   */
  canGetBack(from: Vertex): boolean {
    for (const edge of from.neighbors) {
      if (edge.vertex === this) {
        return true;
      }
    }
    return false;
  }

  /**
   * Method verifies whether the inDegree and outDegree of the vertex is the same and whether it is equal to the degree
   * True is returned when both degrees are equal to the degree parameter. Otherwise false.
   * @param degree : number outDegree and inDegree that should be equal to
   * @return boolean
   */
  equalDegrees(degree: number): boolean {
    if (this.inDegree !== this.outDegree) {
      return false;
    }
    return this.outDegree === degree;
  }

  /**
   * Get the first edge that leads to other vertex than notThisVertex
   * This is useful when you are sure that there are only two edges leaving the vertex.
   * @param notThisVertex : Vertex Edge to this vertex will not be returned
   * @return object
   */
  getEdgeOtherNeighbor(notThisVertex: Vertex): {vertex: Vertex, costs: EdgeCost} {
    for (const edge of this.neighbors) {
      if (edge.vertex !== notThisVertex) {
        return edge;
      }
    }
    return null;
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
