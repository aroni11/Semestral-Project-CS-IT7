import Edge from './edge'
import Vertex from './vertex';

/**
 * Graph object for creating a sample graph using Vertex and Edge objects
 */

class Graph {
    /**
     * Map objects for the graph sample
     */    
    private readonly vertices: Map<number, Vertex>;        
    private readonly edges: Map<number, Edge>;

    /**
     * Initializes new Map objects for the Vertices and Edges displayed on the graph
     */
    constructor() {
        this.vertices = new Map<number, Vertex>();
        this.edges = new Map<number, Edge>();
    }

    /**
     * Adds a Vertex object into the vertices Map object
     * @param x : Vertex object
     */
    addVertex(x: Vertex) : void {
        this.vertices.set(x.id, x);
    }

    /**
     * Adds a Edge object into the edges Map object
     * @param x : Edge object 
     */
    addEdge(x: Edge): void {
        this.edges.set(x.id, x);
    }

    get graph() {
        return { vertices: this.vertices,
                 edges: this.edges };
    }
}