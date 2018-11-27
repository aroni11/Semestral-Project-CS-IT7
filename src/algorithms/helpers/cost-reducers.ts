export default {
  arithemticAvg: (costs: number[]) => costs
    .reduce((prev: number, next: number) => prev + next) / costs.length,
  geometricAvg: (costs: number[]) => Math.pow(
    costs.reduce((prev: number, next: number) => prev * next),
    (1 / costs.length)),
  minCost: (costs: number[]) => Math.min(...costs),
  maxCost: (costs: number[]) => Math.max(...costs)
};
