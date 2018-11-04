import Vertex from './vertex';

/**
 * Graph object for creating a sample graph using Vertex and Edge objects
 */

export default class Graph {
    /**
     * Map objects for the graph sample
     */
    private readonly vertices: Map<number, Vertex>;

    /**
     * Initializes new Map objects for the Vertices displayed on the graph
     */
    constructor() {
        this.vertices = new Map<number, Vertex>();
    }

    /**
     * Adds a Vertex object or number of Vertex objects into the vertices Map object
     * @param x : Vertex object
     */
    addVertex(...x: Vertex[]): void {
        for (const v of x) {
            this.vertices.set(v.id, v);
        }
    }

    /**
     * Get function which returns a certain Vertex inside the Vertices dictionary
     * @param id : The ID of the Vertex object to be returned
     */
    getVertex(id: number): Vertex {
        if (!this.vertices.has(id)) {
            throw new Error('Vertex ' + id + ' not found!');
        }
        return this.vertices.get(id);
    }

    /**
     * Get function which returns the number of vertices in the graph
     */
    getSize(): number {
        return this.vertices.size;
    }

    /**
     * Get function which returns a set of all vertex IDs contained within the graph
     */
    getVertexIDs(): Set<number> {
        const idSet = new Set<number>();
        for (const vertex of this.vertices.values()) {
            idSet.add(vertex.id);
        }
        return idSet;
    }
}
