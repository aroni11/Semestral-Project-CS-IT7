import Edge from './edge';

class Vertex {
  id: number;
  lat: number;
  lng: number;
  neighbors: Array<{
    vertex: Vertex;
    edge: Edge
  }>;
}

export default Vertex;
