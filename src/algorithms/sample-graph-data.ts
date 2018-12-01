import graphBuilder from './graph-builder';
import Edge from './models/edge';
import EdgeCost from './models/edgecost';
import Graph from './models/graph';
import Vertex from './models/vertex';
import data, {getNode} from './sample-api-data';

const sampleGraph = new Graph();

sampleGraph.addVertex(
    new Vertex(getNode(1, 4, 1)),
    new Vertex(getNode(2, 4, 2)),
    new Vertex(getNode(3, 4, 3)),
    new Vertex(getNode(4, 4, 4)),
    new Vertex(getNode(5, 4, 5)),
    new Vertex(getNode(6, 5, 5)),
    new Vertex(getNode(7, 6, 5)),
    new Vertex(getNode(8, 7, 5)),
    new Vertex(getNode(9, 1, 3)),
    new Vertex(getNode(10, 2, 4)),
    new Vertex(getNode(11, 2, 5)),
    new Vertex(getNode(12, 3, 5)),
    new Vertex(getNode(13, 2, 3)),
    new Vertex(getNode(14, 3, 3)),
    new Vertex(getNode(15, 5, 3)),
    new Vertex(getNode(16, 6, 3)),
    new Vertex(getNode(17, 7, 3)),
    new Vertex(getNode(18, 7, 2)),
    new Vertex(getNode(19, 6, 2)),
    new Vertex(getNode(20, 7, 1)),
    new Vertex(getNode(21, 8, 1))
);

const ec1 = new EdgeCost();
const ec2 = new EdgeCost();
const ec3 = new EdgeCost();
const ec4 = new EdgeCost();
const ec5 = new EdgeCost();
const ec6 = new EdgeCost();
const ec7 = new EdgeCost();
const ec8 = new EdgeCost();

ec1.setCost('distance', 1);
ec2.setCost('distance', 2);
ec3.setCost('distance', 3);
ec4.setCost('distance', 4);
ec5.setCost('distance', 5);
ec6.setCost('distance', 6);
ec7.setCost('distance', 7);
ec8.setCost('distance', 8);

/*
Vertex 1
Neighbor 2:  Cost = 1
*/
sampleGraph.getVertex(1).addNeighbor(new Edge(sampleGraph.getVertex(2), ec1));

/*
Vertex 2
Neighbor 1:  Cost = 2
Neighbor 3:  Cost = 1
*/
sampleGraph.getVertex(2).addNeighbor(new Edge(sampleGraph.getVertex(1), ec2));
sampleGraph.getVertex(2).addNeighbor(new Edge(sampleGraph.getVertex(3), ec1));

/*
Vertex 3
Neighbor 2:  Cost = 2
Neighbor 4:  Cost = 1
Neighbor 14: Cost = 5
Neighbor 15: Cost = 3
*/
sampleGraph.getVertex(3).addNeighbor(new Edge(sampleGraph.getVertex(2), ec2));
sampleGraph.getVertex(3).addNeighbor(new Edge(sampleGraph.getVertex(4), ec1));
sampleGraph.getVertex(3).addNeighbor(new Edge(sampleGraph.getVertex(14), ec5));
sampleGraph.getVertex(3).addNeighbor(new Edge(sampleGraph.getVertex(15), ec3));

/*
Vertex 4
Neighbor 3:  Cost = 2
Neighbor 5:  Cost = 1
*/
sampleGraph.getVertex(4).addNeighbor(new Edge(sampleGraph.getVertex(3), ec2));
sampleGraph.getVertex(4).addNeighbor(new Edge(sampleGraph.getVertex(5), ec1));

/*
Vertex 5
Neighbor 4:  Cost = 2
Neighbor 6:  Cost = 1
*/
sampleGraph.getVertex(5).addNeighbor(new Edge(sampleGraph.getVertex(4), ec2));
sampleGraph.getVertex(5).addNeighbor(new Edge(sampleGraph.getVertex(6), ec1));

/*
Vertex 6
Neighbor 5:  Cost = 2
Neighbor 7:  Cost = 1
*/
sampleGraph.getVertex(6).addNeighbor(new Edge(sampleGraph.getVertex(5), ec2));
sampleGraph.getVertex(6).addNeighbor(new Edge(sampleGraph.getVertex(7), ec1));

/*
Vertex 7
Neighbor 6:  Cost = 2
Neighbor 8:  Cost = 1
*/
sampleGraph.getVertex(7).addNeighbor(new Edge(sampleGraph.getVertex(6), ec2));
sampleGraph.getVertex(7).addNeighbor(new Edge(sampleGraph.getVertex(8), ec1));

/*
Vertex 8
Neighbor 7:  Cost = 2
*/
sampleGraph.getVertex(8).addNeighbor(new Edge(sampleGraph.getVertex(7), ec2));

/*
Vertex 9
Neighbor 10: Cost = 3
Neighbor 13: Cost = 4
*/
sampleGraph.getVertex(9).addNeighbor(new Edge(sampleGraph.getVertex(10), ec3));
sampleGraph.getVertex(9).addNeighbor(new Edge(sampleGraph.getVertex(13), ec4));

/*
Vertex 10
Neighbor 11: Cost = 3
*/
sampleGraph.getVertex(10).addNeighbor(new Edge(sampleGraph.getVertex(11), ec3));

/*
Vertex 11
Neighbor 12: Cost = 3
*/
sampleGraph.getVertex(11).addNeighbor(new Edge(sampleGraph.getVertex(12), ec3));

/*
Vertex 12
Neighbor 5:  Cost = 3
*/
sampleGraph.getVertex(12).addNeighbor(new Edge(sampleGraph.getVertex(5), ec3));

/*
Vertex 13
Neighbor 9:  Cost = 5
Neighbor 14: Cost = 4
*/
sampleGraph.getVertex(13).addNeighbor(new Edge(sampleGraph.getVertex(9), ec5));
sampleGraph.getVertex(13).addNeighbor(new Edge(sampleGraph.getVertex(14), ec4));

/*
Vertex 14
Neighbor 3:  Cost = 4
Neighbor 13: Cost = 5
*/
sampleGraph.getVertex(14).addNeighbor(new Edge(sampleGraph.getVertex(3), ec4));
sampleGraph.getVertex(14).addNeighbor(new Edge(sampleGraph.getVertex(13), ec5));

/*
Vertex 15
Neighbor 3:  Cost = 5
Neighbor 16: Cost = 4
*/
sampleGraph.getVertex(15).addNeighbor(new Edge(sampleGraph.getVertex(3), ec5));
sampleGraph.getVertex(15).addNeighbor(new Edge(sampleGraph.getVertex(16), ec4));

/*
Vertex 16
Neighbor 15: Cost = 5
Neighbor 17: Cost = 6
*/
sampleGraph.getVertex(16).addNeighbor(new Edge(sampleGraph.getVertex(15), ec5));
sampleGraph.getVertex(16).addNeighbor(new Edge(sampleGraph.getVertex(17), ec6));

/*
Vertex 17
Neighbor 18: Cost = 6
*/
sampleGraph.getVertex(17).addNeighbor(new Edge(sampleGraph.getVertex(18), ec6));

/*
Vertex 18
Neighbor 19: Cost = 6
Neighbor 20: Cost = 7
*/
sampleGraph.getVertex(18).addNeighbor(new Edge(sampleGraph.getVertex(19), ec6));
sampleGraph.getVertex(18).addNeighbor(new Edge(sampleGraph.getVertex(20), ec7));

/*
Vertex 19
Neighbor 16: Cost = 6
*/
sampleGraph.getVertex(19).addNeighbor(new Edge(sampleGraph.getVertex(16), ec6));

/*
Vertex 20
Neighbor 18: Cost = 8
Neighbor 21: Cost = 7
*/
sampleGraph.getVertex(20).addNeighbor(new Edge(sampleGraph.getVertex(18), ec8));
sampleGraph.getVertex(20).addNeighbor(new Edge(sampleGraph.getVertex(21), ec7));

/*
Vertex 21
Neighbor 20: Cost = 8
*/
sampleGraph.getVertex(21).addNeighbor(new Edge(sampleGraph.getVertex(20), ec8));

console.log(graphBuilder(data.nodes.slice(1), data.ways));

export default sampleGraph;
