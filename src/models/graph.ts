import Edge from './edge'
import Vertex from './vertex';

class Graph {
    private readonly points: Map<number, Vertex>;        
    private readonly edges: Map<number, Edge>;

    constructor() {
        this.points = new Map<number, Vertex>();
        this.edges = new Map<number, Edge>();
    }

    addVertex(x: Vertex) : void {
        this.points.set(x.id, x);
    }

    addEdge(x: Edge): void {
        this.edges.set(x.id, x);
    }

    get graph() {
        return { vertices: this.points,
                 edges: this.edges };
    }
}