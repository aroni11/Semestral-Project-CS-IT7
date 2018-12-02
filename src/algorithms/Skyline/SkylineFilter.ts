import EdgeCost from '../models/edgecost';
import Path from '../pathfinders/path';

interface ISkylineEntry {
    path: Path;
    dominated: boolean;
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
        // This is probably going to be slow. A good idea to use a linked list here instead of setting flags.
        let current = this.data[0];
        while (current !== undefined) {
            const currentCost = current.path.evaluate();
            for (const entry of this.data) {
                if (entry.dominated) {
                    continue;
                }
                const dominator = EdgeCost.dominator(currentCost, entry.path.evaluate());
                if (dominator === undefined) {
                    continue;
                }
                if (dominator === currentCost) {
                    entry.dominated = true;
                    continue;
                }
                current.dominated = true;
                break;
            }
            current = this.data.find((entry: ISkylineEntry) => !entry.dominated);
        }
        return this.data.filter((entry: ISkylineEntry) => !entry.dominated).map((entry: ISkylineEntry) => entry.path);
    }

    private pathToEntry(path: Path): ISkylineEntry {
        return {path, dominated: false};
    }
}
