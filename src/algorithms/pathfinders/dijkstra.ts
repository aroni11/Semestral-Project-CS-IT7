import EdgeCost from '../models/edgecost';
import Graph from '../models/graph';
import Vertex from '../models/vertex';
/**
 * Implements Dijkstra's algorithm to find the shortest path between 2 vertices
 */
export default class DijkstraPathfinder {

    /**
     * Stores best known distances from starting vertex to all the others
     */
    distances: Map<number, {
        distance: number;
        sourceID: number;
    }>;

    /**
     * stores all unvisited vertices
     */
    unvisited: Set<number>;

    /**
     * Returns an array of vertex IDs that represents the shortest path between 2 vertices
     * @param startID : ID of starting vertex
     * @param endID : ID of destination vertex
     * @param mygraph : relevant graph
     */
    FindPath(startID: number, endID: number, mygraph: Graph): number[] {
        this.Initialize(mygraph);
        this.distances.set(startID, {distance: 0, sourceID: -9001});
        this.unvisited.delete(startID);
        let currentVertex = mygraph.getVertex(startID);
        while (this.unvisited.size > 0) {
            this.updateDistances(currentVertex);
            currentVertex = this.getNextVertex(mygraph);
            if (currentVertex.id === endID) {
                break;
            }
        }
        return this.producePath(startID, endID);
    }

    /**
     * Initializes data structures for finding paths in the given graph
     * @param mygraph : relevant graph
     */
    Initialize(mygraph: Graph): void {
        this.unvisited = mygraph.getVertexIDs();
        this.distances = new  Map<number, {
            distance: number;
            sourceID: number;
        }>();
        for (const vertexID of this.unvisited) {
            this.distances.set(vertexID, {distance: global.Infinity, sourceID: -9001});
        }
    }

    /**
     * Finds the next best vertex of the graph to visit
     * @param mygraph : relevant graph
     */
    getNextVertex(mygraph: Graph): Vertex {
        // dumb bruteforce search
        // TODO: make this something that doesn't suck
        let bestVertexID: number;
        let bestDistance: number = global.Infinity;
        for (const vertexID of this.unvisited) {
            const entry = this.distances.get(vertexID);
            if (bestDistance >= entry.distance) {
                bestDistance = entry.distance;
                bestVertexID = vertexID;
            }
        }
        return mygraph.getVertex(bestVertexID);
    }

    /**
     * Updates the distance map if the distance from given vertex is better than the best known
     * @param currentVertex : relevant vertex
     */
    updateDistances(currentVertex: Vertex): void {
        this.unvisited.delete(currentVertex.id);
        const currentDistance = this.distances.get(currentVertex.id).distance;
        for (const neighbor of currentVertex.neighbors) {
            if (!this.unvisited.has(neighbor.vertex.id)) {
                continue;
            }
            const newDistance = currentDistance + neighbor.costs.distance;
            const oldDistanceEntry = this.distances.get(neighbor.vertex.id);
            if (oldDistanceEntry === undefined || oldDistanceEntry.distance > newDistance) {
                this.distances.set(neighbor.vertex.id, {distance: newDistance, sourceID: currentVertex.id});
            }
        }
    }

    /**
     * Produces an array representing the path from startID to endID based on the distance map
     * @param startID : ID of starting vertex
     * @param endID : ID of destination vertex
     */
    producePath(startID: number, endID: number): number[] {
        const path: number[] = [];
        path.push(endID);
        let currentID: number = endID;
        while (currentID !== startID) {
            currentID = this.distances.get(currentID).sourceID;
            path.push(currentID);
        }
        path.reverse();
        return path;
    }
}
