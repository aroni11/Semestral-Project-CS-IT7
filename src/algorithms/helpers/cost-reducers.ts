import EdgeCost from '../models/edgecost';

export default {
  sqrtPlus: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return Math.sqrt(ec2.getCost('distance') + ec2.getCost('time') + ec2.getCost('road_cost'));
  }),

  sqrtMultiply: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return Math.sqrt(ec2.getCost('distance') * ec2.getCost('time') * ec2.getCost('road_cost'));
  }),

  arithmeticMean: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec2.getCost(key));
    return costs.reduce((prev: number, next: number) => prev + next) / costs.length;
  }),

  geometricMean: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec2.getCost(key));
    return Math.pow(
      costs.reduce((prev: number, next: number) => prev * next),
      (1 / costs.length));
  }),

  minCost: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec2.getCost(key));
    return Math.min(...costs);
  }),

  maxCost: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec2.getCost(key));
    return Math.max(...costs);
  }),

  distance: (ec: EdgeCost) => ec.getCost('distance'),

  time: (ec: EdgeCost) => ec.getCost('time'),

  roadCost: (ec: EdgeCost) => ec.getCost('road_cost')
};
