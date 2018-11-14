import sampleGraph from './sample-graph-data';

// Run the simplification as many times as you want, once the "perfect" graph is achieved
sampleGraph.simplifyGraph(sampleGraph.getVertex(1), sampleGraph.getVertex(21), 2);

console.log(sampleGraph.graphVizString());
