/**
 * Edges represent a relation between two vertices.
 */
class EdgeCost {
  /**
   * Combine costs of multiple edges into one
   * @param ecs EdgeCost[] costs to be combined
   * @return EdgeCost Combined cost of all ecs
   */
  static combine(...ecs: EdgeCost[]): EdgeCost {
    const res = new EdgeCost();
    for (const ec of ecs) {
      res.distance += ec.distance;
    }
    return res;
  }

  /**
   * Real distance between two vertices in meters
   */
  distance = 0;
}

export default EdgeCost;
