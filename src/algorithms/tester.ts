import DijkstraPathfinder from './pathfinders/dijkstra';
import MinHeap from './pathfinders/minheap';
import sampleGraph from './sample-graph-data';

const testPathFinder = new DijkstraPathfinder();
console.log(testPathFinder.FindPath(3, 20, sampleGraph).toString());
const minheap = new MinHeap();
minheap.push(3, 0);
minheap.push(1, 0);
minheap.push(4, 0);
minheap.push(8, 0);
minheap.push(5, 0);
minheap.push(6, 0);
minheap.push(9, 0);
minheap.push(2, 0);
minheap.push(7, 0);
console.log(minheap.toString());

while (!minheap.isEmpty()) {
    console.log(minheap.pop());
}
