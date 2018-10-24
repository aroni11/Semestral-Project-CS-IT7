import {INode, Node} from '../api/schema/node';
import {IWay, Way} from '../api/schema/way';

function getNode(id: number, x: number, y: number): INode {
  return new Node({
    _id : id,
    loc : {
      type : 'Point',
      coordinates : [x, y]
    }});
}

function getWay(id: number, wayNodes: INode[]): IWay {
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

const _nodes: INode[] = [
  // just to be able to index the array from 1 (according to node ids)
  null,
  getNode(1, 4, 1),
  getNode(2, 4, 2),
  getNode(3, 4, 3),
  getNode(4, 4, 4),
  getNode(5, 4, 5),
  getNode(6, 5, 5),
  getNode(7, 6, 5),
  getNode(8, 7, 5),
  getNode(9, 1, 3),
  getNode(10, 2, 4),
  getNode(11, 2, 5),
  getNode(12, 3, 5),
  getNode(13, 2, 3),
  getNode(14, 3, 3),
  getNode(15, 5, 3),
  getNode(16, 6, 3),
  getNode(17, 7, 3),
  getNode(18, 7, 2),
  getNode(19, 6, 2),
  getNode(20, 7, 1),
  getNode(21, 8, 1)
];

const _ways: IWay[] = [
  getWay(1, [_nodes[1], _nodes[2], _nodes[3], _nodes[4], _nodes[5], _nodes[6], _nodes[7], _nodes[8]]),
  getWay(2, [_nodes[8], _nodes[7], _nodes[6], _nodes[5], _nodes[4], _nodes[3], _nodes[2], _nodes[1]]),
  getWay(3, [_nodes[9], _nodes[10], _nodes[11], _nodes[12], _nodes[5]]),
  getWay(4, [_nodes[9], _nodes[13], _nodes[14], _nodes[3], _nodes[15], _nodes[16]]),
  getWay(5, [_nodes[16], _nodes[15], _nodes[3], _nodes[14], _nodes[13], _nodes[9]]),
  getWay(6, [_nodes[17], _nodes[18], _nodes[19], _nodes[16], _nodes[17]]),
  getWay(7, [_nodes[18], _nodes[20], _nodes[21]]),
  getWay(8, [_nodes[21], _nodes[20], _nodes[18]])
];

const data = {
  nodes: _nodes,
  ways: _ways
};

export default data;
