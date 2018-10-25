import Graph from './models/graph'
import Vertex from './models/vertex'
import EdgeCost from './models/edgecost'
import {INode, Node} from '../api/schema/node';

export const sampleGraph = new Graph();

function getNode(id: number, x: number, y: number): INode {
    return new Node({
      _id : id,
      loc : {
        type : 'Point',
        coordinates : [x, y]
      }});
  }

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
)

const ec1 = new EdgeCost();
const ec2 = new EdgeCost();
const ec3 = new EdgeCost();
const ec4 = new EdgeCost();
const ec5 = new EdgeCost();
const ec6 = new EdgeCost();
const ec7 = new EdgeCost();
const ec8 = new EdgeCost();

ec1.distance = 1
ec2.distance = 2
ec3.distance = 3
ec4.distance = 4
ec5.distance = 5
ec6.distance = 6
ec7.distance = 7
ec8.distance = 8

/*
Vertex 1
Neighbor 2: Cost = 1
*/
sampleGraph.getVertex(1).addNeighbor(ec1, sampleGraph.getVertex(2)

/*
Vertex 2
Neighbor 2: Cost = 1
*/  