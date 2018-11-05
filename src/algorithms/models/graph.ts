import EdgeCost from './edgecost';
import Vertex from './vertex';

/**
 * Graph object for creating a sample graph using Vertex and Edge objects
 */
export default class Graph {

  /**
   * Examines all the neighbors of the observer vertex and tries to bypass them by creating a new edge
   * Method iterates over the set of edges of observer. It tries to remove vertices that are not crossings.
   * If there is a neighbor of observer which can be removed (see canBeFiltered for criteria) a new edge
   * from observer to the neighbor's neighbor is created and the old edges observer->neighbor and
   * neighbor->neighbor's neighbor are removed from the graph.
   * @param observer : Vertex Vertex whose neighbors are going to be bypassed
   * @param start : Query start vertex
   * @param end : Query destination vertex
   */
  private static filterVertexNeighbors(observer: Vertex, start: Vertex, end: Vertex): void {
    for (const edge of observer.neighbors) {
      if (!Graph.canBeFiltered(edge.vertex, start, end)) {
        continue;
      }
      let secondEdge = edge.vertex.getEdgeOtherNeighbor(observer);
      if (secondEdge !== null) {
        observer.addNeighbor(EdgeCost.combine(edge.costs, secondEdge.costs), secondEdge.vertex);
      } else {
        secondEdge = edge.vertex.neighbors.values().next().value;
      }
      edge.vertex.removeNeighbor(secondEdge);
      observer.removeNeighbor(edge);
    }
  }

  /**
   * Method decides whether a vertex can be removed from graph or not
   * Start vertex and end vertex can never be removed. We can filter out vertices that fall under one of the
   * following categories:
   * 1. Vertex inDegree and outDegree are 1. That means that vertex is the middle element of a simple path.
   * 2. Vertex inDegree and outDegree are 2 and one can get back from all the neighbors in just one step. That means
   * that the vertex is the middle element of a simple bidirectional path.
   * @param vertex : Vertex Vertex that is evaluated
   * @param start : Query start vertex
   * @param end : Query destination vertex
   */
  private static canBeFiltered(vertex: Vertex, start: Vertex, end: Vertex): boolean {
    if (vertex === start || vertex === end) {
      return false;
    }

    if (vertex.equalDegrees(1)) {
      return true;
    }

    if (vertex.equalDegrees(2)) {
      for (const neighbor of vertex.neighbors) {
        // Return false in case there is a neighbor from which you cannot get back
        if (!(vertex.canGetBack(neighbor.vertex))) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Map objects for the graph sample
   */
  private readonly verticesMap: Map<number, Vertex>;

  /**
   * Initializes new Map objects for the Vertices displayed on the graph
   */
  constructor() {
      this.verticesMap = new Map<number, Vertex>();
  }

  /**
   * Adds a Vertex object or number of Vertex objects into the vertices Map object
   * @param x : Vertex object
   */
  addVertex(...x: Vertex[]): void {
      for (const v of x) {
          this.verticesMap.set(v.id, v);
      }
  }

  /**
   * Get function which returns a certain Vertex inside the Vertices dictionary
   * @param id : The ID of the Vertex object to be returned
   */
  getVertex(id: number): Vertex {
      if (!this.verticesMap.has(id)) {
          throw new Error('Vertex ID not found!');
      }
      return this.verticesMap.get(id);
  }

  /**
   * Get all vertices in this graph
   * @return Iterator which can be used to walk through all the vertices in this graph.
   */
  get vertices(): Iterator<Vertex> {
    return this.verticesMap.values();
  }

  /**
   * Stringify the graph so it can be rendered using Graphviz tool
   * @return String representing the edges in the graph
   */
  graphVizString(): string {
    const iterator = this.vertices;
    let next = iterator.next();
    let out = 'digraph {';
    while (!next.done) {
      for (const edge of next.value.neighbors) {
        out += next.value.id + ' -> ' + edge.vertex.id + '\n';
      }
      next = iterator.next();
    }
    return out + '}';
  }

  /**
   * Runs the simplification process several times
   * @param start : Vertex Query start vertex
   * @param end : Vertex Query destination vertex
   * @param runs : number  How many times should the simplification be performed
   * @return Graph Simplified graph object
   */
  simplifyGraph(start: Vertex, end: Vertex, runs: number): Graph {
    for (let i = 0; i < runs; i++) {
      this.simplificationRound(start, end);
    }
    return this;
  }

  /**
   * Simplifies this graph by running simplification once and returns it
   * Method iterates over all the vertices present in the graph and tries to remove their neighbors from the graph.
   * @param start : Vertex Query start vertex
   * @param end : Vertex Query destination vertex
   * @return Graph Simplified graph object
   */
  private simplificationRound(start: Vertex, end: Vertex): Graph {
    const it = this.vertices;
    let next = it.next();
    while (!next.done) {
      Graph.filterVertexNeighbors(next.value, start, end);
      next = it.next();
    }
    return this;
  }
}
