import distance from '@turf/distance';
import {CostFunction} from '../../../config';
import reducers from '../helpers/cost-reducers';
import Vertex from './vertex';

/**
 * Edges represent a relation between two vertices.
 */
class EdgeCost {

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
   * Get edge costs
   */
  public get getCosts(): { [index: string]: number } {
    return this.costs;
  }
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
   * Compare two edges.
   *
   * @param ec1
   * @param ec2
   */
  static equal(ec1: EdgeCost, ec2: EdgeCost): boolean {
    let check = true;

    for (const key of Object.keys(EdgeCost.costKeys)) {
      if (ec1.getCost(key) !== ec2.getCost(key)) {
        check = false;
      }
    }

    return check;
  }

  /**
   * Combine costs of multiple edges into one
   * @param ecs EdgeCost[] costs to be combined
   * @return EdgeCost Combined cost of all ecs
   */
  static combine(...ecs: EdgeCost[]): EdgeCost {
    const res = EdgeCost.zero;
    let roadCostSum = 0;
    for (const ec of ecs) {
      res.setCost('distance', res.getCost('distance') + ec.getCost('distance'));
      res.setCost('time', res.getCost('time') + ec.getCost('time'));
      roadCostSum += ec.getCost('road_cost') * ec.getCost('distance');
    }
    res.setCost('road_cost', roadCostSum / res.getCost('distance'));
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
   * Normalize and compare the costs using the given cost function
   * @param ec1 EdgeCost the first EdgeCost
   * @param ec2 EdgeCost the second EdgeCost
   * @param costFn CostFunction a function to compare the edge costs with
   * @return number A negative/positive number (used in comp functions)
   */
  static compare(ec1: EdgeCost, ec2: EdgeCost, costFn: CostFunction = reducers.arithmeticMean): number {
    const costs1 = ec1.getCosts;
    const costs2 = ec2.getCosts;

    const normalizedEC1 = new EdgeCost();
    const normalizedEC2 = new EdgeCost();

    for (const key in costs1) {
      if (costs1[key] > costs2[key]) {
        normalizedEC1.getCosts[key] = 1;
        normalizedEC2.getCosts[key] = costs2[key] / costs1[key];
      } else {
        normalizedEC2.getCosts[key] = 1;
        normalizedEC1.getCosts[key] = costs1[key] / costs2[key];
      }
    }

    const ec1Mean = ec1.reduce(costFn);
    const ec2Mean = ec2.reduce(costFn);

    return ec1Mean - ec2Mean;
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
   * @param dominatee: EdgeCost the path checked to be dominated
   */
  dominates(dominatee: EdgeCost): boolean {
    if (this.getSum() >= dominatee.getSum()) {
      return false;
    }
    for (const key of Object.keys(this.costs)) {
      if (this.getCost(key) > dominatee.getCost(key)) {
        return false;
      }
    }
    return true;
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
   * Reduce all costs to a single value. Can also handle preferences
   *
   * @param pi Preference weight object
   * @param func Reducer function can be supplied.
   * @returns An object consisting of
   */
  reduceWithPreferences(
    pi: { [index: string]: number },
    func: CostFunction): number {
    const { costKeys } = EdgeCost;

    for (const key of Object.keys(costKeys)) {
      this.setCost(key, this.getCost(key) * pi[key]);
    }

    return func(this);
  }

  /**
   * Reduce all costs to a single value. Preferences are defaulted to 1
   *
   * @param func Reducer function can be supplied.
   * @returns An object consisting of
   */
  reduce(
    func: CostFunction): number {
    const { costKeys } = EdgeCost;
    const pi: { [index: string]: number } = {};

    for (const key of Object.keys(costKeys)) {
      pi[key] = 1;
    }

    return this.reduceWithPreferences(pi, func);
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
    this.costs.time = this.costs.distance / max_speed;
  }
}
export default EdgeCost;
