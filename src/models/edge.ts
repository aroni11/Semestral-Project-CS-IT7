import Node from './node';

class Edge {
  id: number;
  start: Node;
  end: Node;
  // We will discern a proper structure for this down the line
  costs: {
    distance: number;
  };
}

export default Edge;