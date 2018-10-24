import {Request, Response} from 'express';
import {INode, Node} from '../schema/node';

export async function nodesWithinHandler(req: Request, res: Response) {
  if (!req.body.nodes) {
    res.status(400).send('Reference polygon nodes missing');
  } else {
    const nodes: INode[] = req.body.nodes;
    try {
      res.send( await Node.find({
        loc: {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [
                nodes.map((node: INode) => [node.loc.coordinates[0], node.loc.coordinates[1]])
              ]
            }
          }
        }}
      ));
    } catch (e) {
      res.status(503).send(e);
    }
  }
}
