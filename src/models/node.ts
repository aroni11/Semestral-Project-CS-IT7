import Edge from './edge';

class Node {
  id: number;
  lat: number;
  lng: number;
  neighbors: {
    node: Node;
    edge: Edge;
  }[];
}

export default Node;
