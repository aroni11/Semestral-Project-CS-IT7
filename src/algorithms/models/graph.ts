import {CostFunction, PathFinder} from '../../../config';
import Path from '../pathfinders/path';
import yen from '../pathfinders/yen';
import Edge from './edge';
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
   * @param id : number The ID of the Vertex object to be returned
   */
  getVertex(id: number): Vertex {
    if (!this.verticesMap.has(id)) {
      throw new Error(`Vertex ${id} not found!`);
    }
    return this.verticesMap.get(id);
  }

  removeEdge(from: number, to: number): Edge {
    const fromVertex = this.getVertex(from);
    for (const neighbor of fromVertex.neighbors) {
      if (neighbor.vertex.id === to) {
        fromVertex.neighbors.delete(neighbor);
        return neighbor;
      }
    }
  }

  removeVertex(id: number, deletedEdges?: Array<[number, Edge]>): void {
    // first remove all edges to this vertex
    for (const vertex of this.verticesMap.values()) {
      for (const neighbor of vertex.neighbors) {
        if (neighbor.vertex.id === id) {
          vertex.removeNeighbor(neighbor);
          if (deletedEdges) {
            deletedEdges.push([vertex.id, neighbor]);
          }
        }
      }
    }

    this.verticesMap.delete(id);
  }

  topK(start: number, end: number, pathFinder: PathFinder, costsFunction: CostFunction, k: number): Path[] {
    return yen(this, start, end, pathFinder, costsFunction, k);
  }

  /**
   * Stringify the graph so it can be rendered using Graphviz tool
   * @return String representing the edges in the graph
   */
  graphVizString(): string {
    const iterator = this.verticesMap.values();
    let next = iterator.next();
    let out = 'digraph world {';
    while (!next.done) {
      for (const edge of next.value.neighbors) {
        const costs = [...next.value.neighbors].find((ec) => ec.vertex === edge.vertex).costs;
        out += `${next.value.id} -> ${edge.vertex.id} [label = "d:${costs.getCost('distance')},t:${costs.getCost('time')}"]\n`;
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
  simplifyGraph(start: number, end: number, runs: number = 1): Graph {
    const startVertex = this.getVertex(start);
    const endVertex = this.getVertex(end);

    for (let i = 0; i < runs; i++) {
      this.simplificationRound(startVertex, endVertex);
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
    const it = this.verticesMap.values();
    let next = it.next();
    while (!next.done) {
      next.value.bypassNeighbors(start, end);
      next = it.next();
    }
  }
}
