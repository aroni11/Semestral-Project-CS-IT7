import EdgeCost from '../models/edgecost';
import Graph from '../models/graph';
import Vertex from '../models/vertex';
import MinHeap from './minheap';
import Path from './path';
type CostFunc = (cost: EdgeCost) => number;
/**
 * Implements Dijkstra's algorithm to find the shortest path between 2 vertices
 */
export default class DijkstraPathfinder {

    /**
     * Stores all the pathing data found by algorithm
     */
    distances: Map<number, {
        distance: number;
        sourceID: number;
    }>;

    /**
     * Queue for getting the next vertex
     */
    vertexQueue: MinHeap;

    /**
     * stores all visited vertex ids
     */
    visited: Set<number>;

    /**
     * Returns an array of vertex IDs that represents the shortest path between 2 vertices
     * @param startID : ID of starting vertex
     * @param endID : ID of destination vertex
     * @param myGraph : relevant graph
     * @param costFunc : A function that calculates a scalar cost value based on an EdgeCost object
     * @return Path
     */
    FindPath(startID: number, endID: number, myGraph: Graph, costFunc = (cost: EdgeCost) => cost.distance): Path {
        this.Initialize(myGraph);
        this.distances.set(startID, {distance: 0, sourceID: -9001});
        this.visited.delete(startID);
        try {
            let currentVertex = myGraph.getVertex(startID);
            while (currentVertex.id !== endID) {
                this.updateDistances(currentVertex, costFunc);
                currentVertex = myGraph.getVertex(this.vertexQueue.pop().value);
            }
        } catch (error) {
            if (error.message === 'Vertex ID not found!') {
                throw new Error('Destination is unreachable from starting vertex or is not a part of the graph');
            } else {
                throw error;
            }
        }
        return this.producePath(startID, endID, myGraph);
    }

    /**
     * Initializes data structures for finding paths in the given graph
     * @param myGraph : relevant graph
     */
    Initialize(myGraph: Graph): void {
        this.visited = new Set<number>();
        this.distances = new Map<number, {
            distance: number;
            sourceID: number;
        }>();
        this.vertexQueue = new MinHeap();
    }

    /**
     * Updates the distance map if the distance from given vertex is better than the best known
     * @param currentVertex : relevant vertex
     */
    updateDistances(currentVertex: Vertex, costFunc: CostFunc): void {
        this.visited.add(currentVertex.id);
        const currentDistance = this.distances.get(currentVertex.id).distance;
        for (const neighbor of currentVertex.neighbors) {
            if (this.visited.has(neighbor.vertex.id)) {
                continue;
            }
            const newDistance = currentDistance + costFunc(neighbor.costs);
            const oldDistanceEntry = this.distances.get(neighbor.vertex.id);
            if (oldDistanceEntry === undefined || oldDistanceEntry.distance > newDistance) {
                this.distances.set(neighbor.vertex.id, {distance: newDistance, sourceID: currentVertex.id});
                this.vertexQueue.push( newDistance, neighbor.vertex.id);
            }
        }
    }

    /**
     * Produces an object representing the path from startID to endID based on the distance map
     * @param startID : ID of starting vertex
     * @param endID : ID of destination vertex
     * @return Path
     */
    producePath(startID: number, endID: number, myGraph: Graph): Path {
        const path: Path = new Path();
        let lastVertex: Vertex = myGraph.getVertex(endID);
        let currentVertex = lastVertex;
        path.addFront(lastVertex, null);
        while (currentVertex.id !== startID) {
            currentVertex = myGraph.getVertex(this.distances.get(currentVertex.id).sourceID);
            path.addFront(currentVertex, currentVertex.costTo(lastVertex));
            lastVertex = currentVertex;
        }
        return path;
    }
}
