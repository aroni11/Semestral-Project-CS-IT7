import EdgeCost from '../models/edgecost';
import Path from '../pathfinders/path';

interface ISkylineEntry {
    path: Path;
    totalCost: EdgeCost;
    costSum: number;
    wasDominator: boolean;
}
/**
 * Implements simple nested loop skyline filter.
 */
export class SkylineFilter {
    data: ISkylineEntry[];
    /**
     * Filters out dominated paths
     */
    filter(paths: Path[]): Path[] {
        this.data = paths.map(this.pathToEntry);
        // This is probably going to be slow. A good idea to use a linked list here instead of setting flags.
        let dominator = this.data[0];
        while (dominator !== undefined) {
            dominator.wasDominator = true;
            this.data = this.data.filter((dominatee: ISkylineEntry) => !(this.dominates(dominator, dominatee)));
            dominator = this.data.find((entry: ISkylineEntry) => !entry.wasDominator);
        }
        return this.data.map((entry: ISkylineEntry) => entry.path);
    }

    /**
     * Check if a path dominates the other
     * @param dominator : the path checked to dominate
     * @param dominatee : the path checked to be dominated
     */
    private dominates(dominator: ISkylineEntry, dominatee: ISkylineEntry): boolean {
      if (dominator.costSum >= dominatee.costSum) {
        return false;
      }
      for (let key in dominator.totalCost) {
        // @ts-ignore
        let dominatorValue = dominator.totalCost[key];
        // @ts-ignore
        let dominateeValue = dominatee.totalCost[key];
        if(dominatorValue > dominateeValue) {
          return false;
        }
      }
      return true;
    }

    private pathToEntry(path: Path): ISkylineEntry {
        const totalCost = path.evaluate();
        let costSum = 0;
        for (const key of Object.keys(totalCost)) {
            costSum += (totalCost as any)[key];
        }
        return {path, totalCost, costSum, wasDominator: false};
    }
}
