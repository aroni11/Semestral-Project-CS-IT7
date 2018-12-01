import EdgeCost from '../models/edgecost';
import Path from '../pathfinders/path';

interface ISkylineEntry {
    path: Path;
    wasDominator: boolean;
}
/**
 * Implements simple nested loop skyline filter.
 */

export class SkylineFilter {
    data: ISkylineEntry[];

    constructor(paths: Path[]) {
      this.data = paths.map(this.pathToEntry);
    }

    /**
     * Filters out dominated paths
     */
    filter(): Path[] {
        if (this.data.length < 1) {
          throw new Error('Cannot filter empty list.');
        }
        // This is probably going to be slow. A good idea to use a linked list here instead of setting flags.
        let dominator = this.data[0];
        while (dominator !== undefined) {
            dominator.wasDominator = true;
            this.data = this.data.filter((dominatee: ISkylineEntry) => !(dominator.path.dominates(dominatee.path)));
            dominator = this.data.find((entry: ISkylineEntry) => !entry.wasDominator);
        }
        return this.data.map((entry: ISkylineEntry) => entry.path);
    }

    private pathToEntry(path: Path): ISkylineEntry {
        return {path, wasDominator: false};
    }
}
