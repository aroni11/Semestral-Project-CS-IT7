import {INode, Node} from '../api/schema/node';
import {IWay, Way} from '../api/schema/way';

function randNode(id: number): INode {
  return new Node({
    _id : id,
    loc : {
      type : 'Point',
      coordinates : [Math.random() * 10 + 1, Math.random() * 60 + 1]
    }});
}

function randWay(id: number, wayNodes: INode[]): IWay {
  return new Way({
    _id : id,
    tags : {
      highway : 'primary'
    },
    loc : {
      type : 'Polygon',
      coordinates : [],
      nodes : wayNodes.map((x: INode) => x._id)
    }});
}

const nodes: INode[] = [];
const ways: IWay[] = [];

for (let i = 0; i < 20; i++) {
  nodes.push(randNode(i));
}
ways.push(randWay(1, nodes));

console.log(nodes);
console.log(ways);
