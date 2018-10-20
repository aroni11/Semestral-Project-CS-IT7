import {INode, Node} from '../api/schema/node';
import {IWay, Way} from '../api/schema/way';

function randNode(id: number) {
  return new Node({
    _id : id,
    loc : {
      type : 'Point',
      coordinates : [Math.random() * 10 + 1, Math.random() * 60 + 1]
    }});
}

function randWay(id: number, wayNodes: INode[]) {
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

const dummyData = {
  nodes: Array<INode>(),
  ways: Array<IWay>()
};

for (let i = 0; i < 20; i++) {
  dummyData.nodes.push(randNode(i));
}

dummyData.ways.push(randWay(1, dummyData.nodes));

console.log(dummyData);
