import distance from '@turf/distance';
import Vertex from './vertex';

/**
 * Edges represent a relation between two vertices.
 */
class EdgeCost {
  /**
   * Object containing cost keys, and a method for extrapolating the cost on the associated key.
   */
  static costKeys: {
    [index: string]: (param: EdgeCost) => number
  } = {
    // Real distance between two vertices in meters
    distance: (ec: EdgeCost) => ec.getCost('distance'),
    // Real time between two vertices in minutes
    time: (ec: EdgeCost) => ec.getCost('time'),
    // Type of road between two vertices as a float value
    road_cost: (ec: EdgeCost) => ec.getCost('distance') * ec.getCost('road_cost')
  };

  /**
   * Compare to edges.
   *
   * @param ec1
   * @param ec2
   */
  static equal(ec1: EdgeCost, ec2: EdgeCost): boolean {
    let check = true;
    Object.keys(EdgeCost.costKeys).forEach((key) => {
      if (ec1.getCost(key) !== ec2.getCost(key)) {
        check = false;
      }
    });
    return check;
  }

  /**
   * Returns a zero cost
   */
  static get zero(): EdgeCost {
    const zeroObj = new EdgeCost();
    zeroObj.setCost('distance', 0);
    zeroObj.setCost('time', 0);
    zeroObj.setCost('road_cost', 7);
    return zeroObj as EdgeCost;
  }

  /**
   * Combine costs of multiple edges into one
   * @param ecs EdgeCost[] costs to be combined
   * @return EdgeCost Combined cost of all ecs
   */
  static combine(...ecs: EdgeCost[]): EdgeCost {
    const { costKeys, zero } = EdgeCost;
    const res: EdgeCost = zero;
    for (const ec of ecs) {
      for (const key of Object.keys(costKeys)) {
        res.setCost(key, res.getCost(key) + costKeys[key](ec));
      }
    }
    res.setCost('road_cost', res.getCost('road_cost') / res.getCost('distance'));
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

  /**
   * Reduce all costs to a single value. Can also handle preferences
   *
   * @param ecs EdgeCost object
   * @param pi Preference weight object
   * @param func Reducer function can be supplied.
   * @returns An object consisting of
   */
  static reduceWithPreferences(
    ecs: EdgeCost | EdgeCost[],
    pi: { [index: string]: number },
    func: (costs: EdgeCost) => number): number {
    const { costKeys, combine } = EdgeCost;
    let ec: EdgeCost;
    if ((ecs as EdgeCost[]).length) {
      const ecsArr = ecs as EdgeCost[];
      ec = combine(...ecsArr);
    } else {
      ec = ecs as EdgeCost;
    }
    Object.keys(costKeys).forEach((key) => {
      ec.setCost(key, ec.getCost(key) * pi[key]);
    });
    return func(ec);
  }

  /**
   * Reduce all costs to a single value. Preferences are defaulted to 1
   *
   * @param ecs EdgeCost object
   * @param func Reducer function can be supplied.
   * @returns An object consisting of
   */
  static reduce(
    ecs: EdgeCost | EdgeCost[],
    func: (costs: EdgeCost) => number): number {
    const { costKeys } = EdgeCost;
    const pi: { [index: string]: number } = {};
    Object.keys(costKeys).forEach((key) => pi[key] = 1);
    return this.reduceWithPreferences(ecs, pi, func);
  }

  private costs: { [index: string]: number } = {};

  /**
   * Constructor for the EdgeCost object which gives every edge between vertices a weight value for further calculation
   * @param v1: Vertex - vertex object which forms the edge with the second one
   * @param v2: Vertex - vertex which forms the edge with the first one
   * @param road_type: string - type of road which connects the two vertices
   */
  constructor(v1: Vertex = null, v2: Vertex = null, road_type: string = null) {
    if (v1 == null || v2 == null) {
      return;
    }
    this.costs.distance = distance([v1.lng, v1.lat], [v2.lng, v2.lat]);
    this.setRoadCost(road_type);
  }

  getSum() {
    let sum = 0;
    Object.keys(this.costs).forEach((key) => sum += this.costs[key]);
    return sum;
  }

  /**
   * Check if this path dominates the other
   * @param dominatee : the path checked to be dominated
   */
  dominates(dominatee: EdgeCost): boolean {
    if (this.getSum() >= dominatee.getSum()) {
      return false;
    }
    for (const key in this.costs) {
      if (this.costs.hasOwnProperty(key)) {
        const dominatorValue = this.costs[key];
        const dominateeValue = dominatee.costs[key];
        if (dominatorValue > dominateeValue) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Get edge costs
   */
  public get getCosts(): { [index: string]: number } {
    return this.costs;
  }

  /**
   * Get specific road cost
   *
   * @param key Key of cost to get
   */
  public getCost(key: string): number {
    return this.costs[key];
  }

  /**
   * Set one particular cost
   *
   * @param key Key of cost to set
   * @param value New value
   */
  public setCost(key: string, value: number): void {
    this.costs[key] = value;
  }

  /**
   * Method which determines the cost value depending on the road type between vertices
   * @param road_type: string - Type of road
   */
  private setRoadCost(road_type: string = null) {
    let max_speed: number;
    switch (road_type) {
      case 'motorway':
        this.costs.road_cost = 1;
        max_speed = 100;
        break;
      case 'trunk':
        this.costs.road_cost = 2;
        max_speed = 80;
        break;
      case 'primary':
        this.costs.road_cost = 3;
        max_speed = 70;
        break;
      case 'motorway_link':
        this.costs.road_cost = 4;
        max_speed = 60;
        break;
      case 'secondary':
        this.costs.road_cost = 5;
        max_speed = 60;
        break;
      case 'tertiary':
        this.costs.road_cost = 6;
        max_speed = 50;
        break;
      case 'unclassified':
        this.costs.road_cost = 7;
        max_speed = 50;
        break;
      case 'trunk_link':
        this.costs.road_cost = 8;
        max_speed = 40;
        break;
      case 'primary_link':
        this.costs.road_cost = 9;
        max_speed = 30;
        break;
      case 'secondary_link':
        this.costs.road_cost = 10;
        max_speed = 30;
        break;
      case 'tertiary_link':
        this.costs.road_cost = 11;
        max_speed = 30;
        break;
      case 'residential':
        this.costs.road_cost = 12;
        max_speed = 30;
        break;
      case 'service':
        this.costs.road_cost = 13;
        max_speed = 15;
        break;
      case 'living_street':
        this.costs.road_cost = 14;
        max_speed = 15;
        break;
      default:
        this.costs.road_cost = 7;
        max_speed = 50;
        break;
    }
    this.costs.time = this.costs.distance / max_speed; // TODO milliseconds?
  }

}

export default EdgeCost;
