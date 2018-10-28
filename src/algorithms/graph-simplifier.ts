import EdgeCost from './models/edgecost';
import Graph from './models/graph';
import Vertex from './models/vertex';
import sampleGraph from './sample-graph-data';

export default class GraphSimplifier {
  /**
   * Method verifies whether exists an edge back from the 'from' vertex back to the 'to' vertex
   * If there is at least one edge from 'from' vertex' to 'to' vertex true is returned. Otherwise false.
   * @param to : Vertex  Vertex that we want to be able to get back to
   * @param from : Vertex Vertex to get back from
   * @return boolean
   */
  static canGetBack(to: Vertex, from: Vertex): boolean {
    for (const edge of from.neighbors) {
      if (edge.vertex === to) {
        return true;
      }
    }
    return false;
  }

  /**
   * Method verifies whether the inDegree and outDegree of the vertex is the same and whether it is equal to the degree
   * True is returned when both degrees are equal to the degree parameter. Otherwise false.
   * @param vertex : Vertex Vertex to examine
   * @param degree : number outDegree and inDegree that should be equal to
   * @return boolean
   */
  static equalDegrees(vertex: Vertex, degree: number): boolean {
    if (vertex.inDegree !== vertex.outDegree) {
      return false;
    }
    return vertex.outDegree === degree;
  }

  /**
   * Get the first edge that leads to other vertex than notThisVertex
   * This is useful when you are sure that there are only two edges leaving the vertex.
   * @param vertex : Vertex Vertex whose neighbors will be considered
   * @param notThisVertex : Vertex Edge to this vertex will not be returned
   * @return object
   */
  static getEdgeOtherNeighbor(vertex: Vertex, notThisVertex: Vertex): {vertex: Vertex, costs: EdgeCost} {
    for (const edge of vertex.neighbors) {
      if (edge.vertex !== notThisVertex) {
        return edge;
      }
    }
    return null;
  }

  /**
   * Graph that will be simplified
   */
  graph: Graph;

  /**
   * Start vertex which is specified as the starting point for path search algorithms.
   * This vertex WILL NEVER be removed from the graph.
   */
  start: Vertex;

  /**
   * Destination vertex which is specified as the destination for path search algorithms.
   * This vertex WILL NEVER be removed from the graph.
   */
  end: Vertex;

  /**
   * Construct GraphSimplifier object
   * Note that the graph passed to this object and all the nodes inside it will be modified!
   * @param graph : Graph Graph to be simplified
   * @param start : Vertex Start vertex for the current path query
   * @param end : Vertex Destination vertex for the current path query
   */
  constructor(graph: Graph, start: Vertex, end: Vertex) {
    this.graph = graph;
    this.start = start;
    this.end = end;
  }

  /**
   * Simplifies the graph stored in this.graph and returns it
   * Method iterates over all the vertices present in the graph and tries to remove their neighbors from the graph.
   * @return Graph Simplified graph object
   */
  simplifyGraph(): Graph {
    const it = this.graph.vertices;
    let next = it.next();
    while (!next.done) {
      this.filterVertexNeighbors(next.value);
      next = it.next();
    }
    return this.graph;
  }

  /**
   * Examines all the neighbors of the observer vertex and tries to bypass them by creating a new edge
   * Method iterates over the set of edges of observer. It tries to remove vertices that are not crossings.
   * If there is a neighbor of observer which can be removed (see canBeFiltered for criteria) a new edge
   * from observer to the neighbor's neighbor is created and the old edges observer->neighbor and
   * neighbor->neighbor's neighbor are removed from the graph.
   * @param observer : Vertex Vertex whose neighbors are going to be bypassed
   */
  filterVertexNeighbors(observer: Vertex): void {
    for (const edge of observer.neighbors) {
      if (!this.canBeFiltered(edge.vertex)) {
        continue;
      }
      let secondEdge = GraphSimplifier.getEdgeOtherNeighbor(edge.vertex, observer);
      if (secondEdge !== null) {
        observer.addNeighbor(EdgeCost.combine(edge.costs, secondEdge.costs), secondEdge.vertex);
        // observer.addNeighbor(EdgeCost.combine(edge.costs, secondEdge.costs), secondEdge.vertex);
      } else {
        secondEdge = edge.vertex.neighbors.values().next().value;
      }
      edge.vertex.removeNeighbor(secondEdge);
      // 'remove' neighbor but do not modify the array indexes
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
   */
  canBeFiltered(vertex: Vertex): boolean {
    if (vertex === this.start || vertex === this.end) {
      return false;
    }

    if (GraphSimplifier.equalDegrees(vertex, 1)) {
      return true;
    }

    if (GraphSimplifier.equalDegrees(vertex, 2)) {
      for (const neighbor of vertex.neighbors) {
        // Return false in case there is a neighbor from which you cannot get back
        if (!(GraphSimplifier.canGetBack(vertex, neighbor.vertex))) {
          return false;
        }
      }
      return true;
    }

    return false;
  }
}

const s = new GraphSimplifier(sampleGraph, sampleGraph.getVertex(1), sampleGraph.getVertex(21));

// Run the simplification as many times as you want, once the "perfect" graph is achieved
s.simplifyGraph();

console.log(sampleGraph.graphVizString());
