import EdgeCost from '../models/edgecost';

export default {
  sqrtTimePlusDistance: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return Math.sqrt(ec2.getCost('distance') + ec2.getCost('time'));
  }),

  sqrtTimeByDistance: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return Math.sqrt(ec2.getCost('distance') * ec2.getCost('time'));
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
  })
};
