import Graph from '../algorithms/models/graph';
import {dijkstra} from '../algorithms/pathfinders/dijkstra';
import Path from '../algorithms/pathfinders/path';
import {skyline} from '../algorithms/Skyline/SkylineFilter';
import Timer from './timer';

export function skylineExperiment(graph: Graph, startID: number, endID: number) {
    // Hardcoded trash... this is likely one-time use anyway and we need it tomorrow so..
    console.log('Beginning skyline experiment');
    const fs = require('fs');
    let output = ' ,';
    const timer10 = new Timer(1);
    const testpaths10 = graph.topK(startID, endID, dijkstra, undefined, 10);
    let skylinepaths10: Path[];
    console.log('pathlists initialised');
    const addCost = (a: number, paths: Path[]) => {
        for (const path of paths) {
            for (const edge of path.pathData) {
                edge.costs.setCost(a.toString(), Math.random());
                console.log(edge.costs);
                console.log(Object.keys(edge.costs.getCosts));
            }
        }
    };
    for (let i = 0; i < 10; i += 1) {
        output += ', ' + i;
        console.log('Cost count:' + (i + 3));
        timer10.runTest(() => { skylinepaths10 = skyline(testpaths10); });
        addCost(i, testpaths10);
        console.log(skylinepaths10.length);
    }

    output += '\n';
    output += '10paths, ' + timer10.toString();
    fs.writeFileSync('SkylineExperiment.csv', output);
}
