import Vertex from './vertex';

/**
 * Edges represent a relation between two vertices.
 */
class EdgeCost {
  /**
   * Returns a zero cost
   */
  static get zero(): EdgeCost {
    const newEdgeCost = new EdgeCost();
    newEdgeCost.distance = 0;
    newEdgeCost.time = 0;
    newEdgeCost.road_cost = 0;

    return newEdgeCost;
  }
  /**
   * Combine costs of multiple edges into one
   * @param ecs EdgeCost[] costs to be combined
   * @return EdgeCost Combined cost of all ecs
   */

  static combine(...ecs: EdgeCost[]): EdgeCost {
    const res = new EdgeCost();
    for (const ec of ecs) {
      res.distance += ec.distance;
      res.time += ec.time;
      res.road_cost += ec.distance * ec.road_cost;
    }

    res.road_cost /= res.distance;

    return res;
  }

  static dominator(lhs: EdgeCost, rhs: EdgeCost): EdgeCost {
    let dominator: EdgeCost;
    let dominatee: EdgeCost;
    if (lhs.getSum() < rhs.getSum()) {
        dominator = lhs;
        dominatee = rhs;
    } else {
        dominator = rhs;
        dominatee = lhs;
    }
    return (dominator.dominates(dominatee)) ? dominator : undefined;
  }

  static equal(ec1: EdgeCost, ec2: EdgeCost): boolean {
    return ec1.distance  === ec2.distance
        && ec1.time      === ec2.time
        && ec1.road_cost === ec2.road_cost;
  }

  // Real distance between two vertices in meters
  distance = 0;
  // Real time between two vertices in minutes
  time = 0;
  // Type of road between two vertices as a float value
  road_cost = 0;

  /**
   * Constructor for the EdgeCost object which gives every edge between vertices a weight value for further calculation
   * @param v1: Vertex - vertex object which forms the edge with the second one
   * @param v2: Vertex - vertex which forms the edge with the first one
   * @param road_type: string - type of road which connects the two vertices
   */
  constructor(v1: Vertex = null, v2: Vertex = null, road_type: string = null) {

    if (v1 == null) {
      return;
    }

    const lngSq = Math.pow((v1.lng - v2.lng), 2);
    const latSq = Math.pow((v1.lat - v2.lat), 2);
    this.distance = Math.sqrt(latSq + lngSq);
    this.setRoadCost(road_type);
  }

  getSum() {
    let costSum = 0;
    for (const key of Object.keys(this)) {
      costSum += (this as any)[key];
    }
    return costSum;
  }

  /**
   * Check if a path dominates the other
   * @param dominator : the path checked to dominate
   * @param dominatee : the path checked to be dominated
   */
  dominates(dominatee: EdgeCost): boolean {
    if (this.getSum() >= dominatee.getSum()) {
      return false;
    }
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const dominatorValue = (this as any)[key];
        const dominateeValue = (dominatee as any)[key];
        if (dominatorValue > dominateeValue) {
          return false;
        }
      }

    }
    return true;
  }
  /**
   * Method which determines the cost value depending on the road type between vertices
   * @param road_type: string - Type of road
   */
  private setRoadCost(road_type: string = null) {
    let max_speed: number;

    switch (road_type) {
      case 'motorway':
        this.road_cost = 1;
        max_speed = 100;
        break;
      case 'trunk':
        this.road_cost = 2;
        max_speed = 80;
        break;
      case 'primary':
        this.road_cost = 3;
        max_speed = 70;
        break;
      case 'motorway_link':
        this.road_cost = 4;
        max_speed = 60;
        break;
      case 'secondary':
        this.road_cost = 5;
        max_speed = 60;
        break;
      case 'tertiary':
        this.road_cost = 6;
        max_speed = 50;
        break;
      case 'unclassified':
        this.road_cost = 7;
        max_speed = 50;
        break;
      case 'trunk_link':
        this.road_cost = 8;
        max_speed = 40;
        break;
      case 'primary_link':
        this.road_cost = 9;
        max_speed = 30;
        break;
      case 'secondary_link':
        this.road_cost = 10;
        max_speed = 30;
        break;
      case 'tertiary_link':
        this.road_cost = 11;
        max_speed = 30;
        break;
      case 'residential':
        this.road_cost = 12;
        max_speed = 30;
        break;
      case 'service':
        this.road_cost = 13;
        max_speed = 15;
        break;
      case 'living_street':
        this.road_cost = 14;
        max_speed = 15;
        break;
      default:
        this.road_cost = 7;
        max_speed = 50;
        break;
    }
    this.time = this.distance / (max_speed / 60);
  }

}

export default EdgeCost;
