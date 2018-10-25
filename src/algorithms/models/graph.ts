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
     * Initializes new Map objects for the Vertices and Edges displayed on the graph
     */
    constructor() {
        this.vertices = new Map<number, Vertex>();
    }

    /**
     * Adds a Vertex object or number of Vertex objects into the vertices Map object
     * @param x : Vertex object
     */
    addVertex(...x: Vertex[]) : void {
        for(const v of x) {
            this.vertices.set(v.id, v);
        }
    }

    /**
     * Get function which returns a certain Vertex inside the Vertices dictionary
     * @param id : The ID of the Vertex object to be returned
     */
    getVertex(id : number) {
        if(!(id in this.vertices))
            throw new Error('Vertex ID not found!')
        else
            return this.vertices.get(id);           
    }
}