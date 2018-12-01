import Edge from '../models/edge';
import EdgeCost from '../models/edgecost';
import Vertex from '../models/vertex';

/**
 * Path class, stores pathData and costs in a path
 */
export default class Path {
  static join(path1: Path, path2: Path): Path {
    if (path1.last().vertex.id !== path2.first().vertex.id) {
      throw new Error('Can\'t join paths, common vertex not found');
    }
    return new Path(path1.pathData.slice(0, path1.pathData.length - 1).concat(path2.pathData));
  }

  static equal(path1: Path, path2: Path): boolean {
    const vertices1 = path1.pathData.map((edge: Edge) => edge.vertex.id);
    const vertices2 = path2.pathData.map((edge: Edge) => edge.vertex.id);

    for (let i = 0; i < vertices1.length; i++) {
      if (vertices1[i] !== vertices2[i]) {
        return false;
      }
    }
    return true;
  }

  static compare(a: Path, b: Path): number { // TODO diversity? distance? time? make use of compareFunc
    // let sameVertices = 0;
    // for (const edgeA of a.pathData) {
    //   if (b.pathData.some((edgeB) => edgeA.vertex.id === edgeB.vertex.id)) {
    //     sameVertices++;
    //   }
    // }
    //
    // const diversity = (sameVertices / a.pathData.length) * 2 + 1;
    // return a.evaluate().time * diversity - b.evaluate().time;
    return a.evaluate().distance - b.evaluate().distance;
  }

  pathData: Edge[];

  constructor(pathData: Edge[] = []) {
    this.pathData = pathData;
  }

  first(): Edge {
    if (this.pathData.length === 0) {
      throw new Error('Path is empty, can\'t access first element');
    }
    return this.pathData[0];
  }

  last(): Edge {
    if (this.pathData.length === 0) {
      throw new Error('Path is empty, can\'t access last element');
    }
    return this.pathData[this.pathData.length - 1];
  }

  /**
   * Add a vertex to the end of the path
   * @param vertex: Vertex the next vertex in the path
   * @param edgecost: EdgeCost the cost to the added vertex
   */
  add(vertex: Vertex, edgecost: EdgeCost): void {
    this.pathData.push(new Edge(vertex, EdgeCost.zero));
    this.pathData[this.pathData.length - 1].costs = edgecost;
  }

  /**
   * Add a vertex to the start of the path
   * @param vertex: Vertex the new starting vertex in the path
   * @param edgecost: EdgeCost the cost from the added vertex
   */
  addFront(vertex: Vertex, edgecost: EdgeCost): void {
    this.pathData.unshift(new Edge(vertex, edgecost));
  }

  /**
   * Returns combined cost of the path
   * @return EdgeCost
   */
  evaluate(): EdgeCost {
    if (this.pathData.length === 0) {
      return EdgeCost.zero;
    }

    const costs = this.pathData.map((pathElement: Edge) => pathElement.costs);
    return costs.reduce((total: EdgeCost, added: EdgeCost) => EdgeCost.combine(total, added));
  }

  slice(start: number, end: number): Path {
    return new Path(this.pathData.slice(start, end));
  }

  toString() {
    let string = '[';
    for (const entry of this.pathData) {
      string += entry.vertex.id + ' ';
    }
    string += ']';
    return string;
  }

  dominates(dominatee: Path): boolean {
    return this.evaluate().dominates(dominatee.evaluate());
  }
}
