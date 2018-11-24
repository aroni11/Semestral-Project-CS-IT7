import EdgeCost from '../models/edgecost';
import Vertex from '../models/vertex';
/**
 * An element of the path
 */
interface IPathElement {
    /**
     * Vertex in the path
     */
    vertex: Vertex;
    /**
     * Cost of going to the next vertex
     */
    edgecost: EdgeCost;
}
/**
 * Path class, stores pathData and costs in a path
 */
export default class Path {
    pathData: IPathElement[];
    constructor() {
        this.pathData = [];
    }

    /**
     * Add a vertex to the end of the path
     * @param vertex : the next vertex in the path
     * @param edgecost : the cost to the added vertex
     */
    add(vertex: Vertex, edgecost: EdgeCost): void {
        this.pathData.push({vertex, edgecost: EdgeCost.zero});
        this.pathData[this.pathData.length - 1].edgecost = edgecost;
    }

    /**
     * Add a vertex to the start of the path
     * @param vertex : the new starting vertex in the path
     * @param edgecost : the cost from the added vertex
     */
    addFront(vertex: Vertex, edgecost: EdgeCost): void {
        this.pathData.unshift({vertex, edgecost});
    }

    /**
     * Returns combined cost of the path
     * @return EdgeCost
     */
    evaluate(): EdgeCost {
        const costs = this.pathData.map((pathElement: IPathElement) => pathElement.edgecost);
        return costs.reduce((total: EdgeCost, added: EdgeCost) => EdgeCost.combine(total, added));
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
