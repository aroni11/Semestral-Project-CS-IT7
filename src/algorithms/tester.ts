import DijkstraPathfinder from './pathfinders/dijkstra';
import sampleGraph from './sample-graph-data';
const testPathFinder = new DijkstraPathfinder();
console.log(testPathFinder.FindPath(3, 20, sampleGraph));
