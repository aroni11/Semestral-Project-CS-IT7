import { CostFunction } from '../../../config';
import EdgeCost from '../models/edgecost';

const reducers: {
  [index: string]: CostFunction
} = {
  sqrtTimePlusDistance: (ec: EdgeCost): number => {
    return Math.sqrt(ec.getCost('distance') + ec.getCost('time'));
  },

  sqrtTimeByDistance: (ec: EdgeCost): number => {
    return Math.sqrt(ec.getCost('distance') * ec.getCost('time'));
  },

  arithemticMean: (ec: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec.getCost(key));
    return costs.reduce((prev: number, next: number) => prev + next) / costs.length;
  },

  geometricMean: (ec: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec.getCost(key));
    return Math.pow(
      costs.reduce((prev: number, next: number) => prev * next),
      (1 / costs.length));
  },

  minCost: (ec: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec.getCost(key));
    return Math.min(...costs);
  },

  maxCost: (ec: EdgeCost): number => {
    const costs = Object.keys(EdgeCost.costKeys).map((key) => ec.getCost(key));
    return Math.max(...costs);
  }
};

const getReducer = (key: string) => (ecs: EdgeCost | EdgeCost[]) => EdgeCost.reduce(ecs, reducers[key]);

const generateWrapper = (): { [index: string]: CostFunction } => {
  const obj: {
    [index: string]: CostFunction;
  } = {};
  for (const key of Object.keys(reducers)) {
    obj[key] = getReducer(key);
  }
  return obj;
};

export const reducerKeys = {
  sqrtTimePlusDistance: 'sqrtTimePlusDistance',
  sqrtTimeByDistance: 'sqrtTimeByDistance',
  arithmeticMean: 'arithmeticMean',
  geometricMean: 'geometricMean',
  minCost: 'minCost',
  maxCost: 'maxCost'
};

export default generateWrapper();
