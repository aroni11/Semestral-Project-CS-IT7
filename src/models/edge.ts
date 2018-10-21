import Vertex from './vertex';

class Edge {
  id: number;
  start: Vertex;
  end: Vertex;
  // We will discern a proper structure for this down the line
  costs: {
    distance: number;
  };
}

export default Edge;
