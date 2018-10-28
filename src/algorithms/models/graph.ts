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
     * Initializes new Map objects for the Vertices displayed on the graph
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
     * @param id : The ID of the Vertex object to be returned
     */
    getVertex(id: number): Vertex {
        if (!this.verticesMap.has(id)) {
            throw new Error('Vertex ID not found!');
        }
        return this.verticesMap.get(id);
    }

    /**
     * Get all vertices in this graph
     * @return Iterator which can be used to walk through all the vertices in this graph.
     */
    get vertices(): Iterator<Vertex> {
      return this.verticesMap.values();
    }

    /**
     * Stringify the graph so it can be rendered using Graphviz tool
     * @return String representing the edges in the graph
     */
    public graphVizString(): string {
      const iterator = this.vertices;
      let next = iterator.next();
      let out = '';
      while (!next.done) {
        for (const edge of next.value.neighbors) {
          out += next.value.id + ' -> ' + edge.vertex.id + '\n';
        }
        next = iterator.next();
      }
      return out;
    }
}
