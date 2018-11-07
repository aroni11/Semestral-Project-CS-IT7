import EdgeCost from './edgecost';
import Vertex from './vertex';

/**
 * Graph object for creating a sample graph using Vertex and Edge objects
 */
export default class Graph {

  /**
   * Map objects for the graph sample
   */
  private readonly verticesMap: Map<number, Vertex>;

  /**
   * Initializes new Map object for the Vertices displayed on the graph
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
  simplifyGraph(start: Vertex, end: Vertex, runs: number = 1): Graph {
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
  private simplificationRound(start: Vertex, end: Vertex): void {
    const it = this.vertices;
    let next = it.next();
    while (!next.done) {
      next.value.bypassNeighbors(start, end);
      next = it.next();
    }
  }
}
