import EdgeCost from '../models/edgecost';
import Vertex from '../models/vertex';
/**
 * Path class, stores pathData and costs in a path
 */
export default class Path {
    pathData: Array<{vertex: Vertex, edgecost: EdgeCost}>;
    constructor() {
        this.pathData = new Array<{vertex: Vertex, edgecost: EdgeCost}>();
    }

    add(vertex: Vertex, edgecost: EdgeCost): void {
        this.pathData.push({vertex, edgecost});
    }
    addFront(vertex: Vertex, edgecost: EdgeCost): void {
        this.pathData.unshift({vertex, edgecost});
    }
    evaluate(): number {
        let pathCost = 0;
        for (const entry of this.pathData) {
            pathCost += entry.edgecost.distance;
        }
        return pathCost;
    }
    toString() {
        let string = '[';
        for (const entry of this.pathData) {
            string += entry.vertex.id + ' ';
        }
        string += ']';
        return string;
    }
}
