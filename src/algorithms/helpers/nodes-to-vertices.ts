import { INode } from '../../api/schema/node';
import Vertex from '../models/vertex';

export default (nodes: INode[]): Vertex[] => {
  const vs = [];
  for (const node of nodes) {
    vs.push(new Vertex(node));
  }
  return vs;
};
