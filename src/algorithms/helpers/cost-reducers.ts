import EdgeCost from '../models/edgecost';
import {graphMaxCosts} from "../../../config";

export default {
  sqrtTimePlusDistance: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
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

  normalizedSum: (ec: EdgeCost) => normalizedDistance(ec) + normalizedRoadCost(ec),

  distance: (ec: EdgeCost) => ec.getCost('distance'),

  time: (ec: EdgeCost) => ec.getCost('time'),

  roadCost: (ec: EdgeCost) => ec.getCost('road_cost'),

  normalizedSqrtTimes: (ec: EdgeCost) => Math.sqrt(normalizedTime(ec) * normalizedDistance(ec) * normalizedRoadCost(ec)),

  normalizedsqrtPlus: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return Math.sqrt(
      normalizedTime(ec2) + normalizedDistance(ec2) + normalizedRoadCost(ec2)
    );
  }),

  normalizedArithmeticMean: (ec: EdgeCost): number => {
    console.log(normalizedDistance(ec));
    return (normalizedTime(ec) + normalizedDistance(ec) + normalizedRoadCost(ec)) / 3
  },

  normalizedGeometricMean: (ec: EdgeCost) => ec.reduce((ec2: EdgeCost): number => {
    return (
      Math.pow(
        normalizedTime(ec2) * normalizedDistance(ec2) * normalizedRoadCost(ec2),
        1/3
      ));
  }),

};

 function normalizedDistance(ec: EdgeCost): number {
   return ec.getCost('distance') / graphMaxCosts.getCost('distance');
 }

  function normalizedTime(ec: EdgeCost): number  {
   return ec.getCost('time') / graphMaxCosts.getCost('time');
  } 

  function normalizedRoadCost(ec: EdgeCost): number {
   return ec.getCost('road_type') / graphMaxCosts.getCost('road_type');
  }
