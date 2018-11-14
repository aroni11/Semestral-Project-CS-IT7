import { INode } from '../../api/schema/node';
import EdgeCost from './edgecost';

enum Simplification {
  OneWay,
  TwoWay,
  NotPossible
}

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
   * Array containing all neighbors of a Vertex, including costs of path to them
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

  /**
   * Increment in-degree. To be called whenever a neighbor is added
   */
  public incrInDegree(): void {
    this.inDegree++;
  }

  /**
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
    vertex.incrInDegree();
    this.neighbors.add({
      costs,
      vertex
    });
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

  /**
   * Examines all the neighbors of this vertex and tries to bypass them by creating a new edge
   * Method iterates over the set of edges. It tries to remove vertices that are not crossings.
   * If there is a neighbor which can be removed (see canBeFiltered for criteria) a new edge
   * from this vertex to the neighbor's neighbor is created and the old edges this->neighbor and
   * neighbor->neighbor's neighbor are removed from the graph.
   * @param start : Query start vertex
   * @param end : Query destination vertex
   */
  bypassNeighbors(start: Vertex, end: Vertex): void {
    for (const edge of this.neighbors) {
      const decision = edge.vertex.canBeFiltered(start, end);
      let secondEdge;

      switch (decision) {
        case Simplification.NotPossible:
          continue;
        case Simplification.OneWay:
          secondEdge = edge.vertex.neighbors.values().next().value;
          break;
        case Simplification.TwoWay:
          secondEdge = edge.vertex.getEdgeOtherNeighbor(this);
          break;
        default:
          throw new Error('Unknown result value.');
      }

      // add bypassing edge in case the original edge does not lead back to observer
      if (secondEdge.vertex !== this) {
        this.addNeighbor(EdgeCost.combine(edge.costs, secondEdge.costs), secondEdge.vertex);
      }

      edge.vertex.removeNeighbor(secondEdge);
      this.removeNeighbor(edge);
    }
  }

  /**
   * Method decides whether this vertex can be removed from graph or not
   * Start vertex and end vertex can never be removed. We can filter out vertices that fall under one of the
   * following categories:
   * 1. Vertex inDegree and outDegree are 1. That means that vertex is the middle element of a simple path.
   * 2. Vertex inDegree and outDegree are 2 and one can get back from all the neighbors in just one step. That means
   * that the vertex is the middle element of a simple bidirectional path.
   * @param start : Query start vertex
   * @param end : Query destination vertex
   */
  canBeFiltered(start: Vertex, end: Vertex): Simplification {
    if (this === start || this === end) {
      return Simplification.NotPossible;
    }

    if (this.equalDegrees(1)) {
      return Simplification.OneWay;
    }

    if (this.equalDegrees(2)) {
      for (const neighbor of this.neighbors) {
        // Return false in case there is a neighbor from which you cannot get back
        if (!(this.canGetBack(neighbor.vertex))) {
          return Simplification.NotPossible;
        }
      }
      return Simplification.TwoWay;
    }
    return Simplification.NotPossible;
  }
}

export default Vertex;
